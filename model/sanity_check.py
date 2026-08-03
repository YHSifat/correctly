"""Run a full training-pipeline sanity check without training the model."""

from __future__ import annotations

import argparse
import logging
import random
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from model.config import PipelineConfig, build_argument_parser, build_pipeline_config
from model.dataset import DatasetBuilderConfig, GrammarDatasetBuilder
from model.tokenization import GrammarTokenizer, TokenizationConfig
from model.tokenizer_analysis import TokenizerAnalysisConfig, TokenizerAnalyzer


LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class SanityCheckConfig:
    """Configuration for the training pipeline sanity check."""

    sample_count: int = 5
    force_tokenizer_analysis: bool = True


def build_sanity_argument_parser() -> argparse.ArgumentParser:
    """Create CLI arguments for the sanity check."""

    parser = build_argument_parser()
    parser.description = "Run a full training-pipeline sanity check without training."
    parser.add_argument("--sample-count", type=int, default=5, help="Number of random training samples to inspect.")
    return parser


def select_sample_indices(dataset_size: int, sample_count: int, random_seed: int) -> list[int]:
    """Select random sample indices from the training dataset."""

    if dataset_size < sample_count:
        raise ValueError(f"Training dataset has only {dataset_size} rows, but {sample_count} samples were requested.")

    indices = list(range(dataset_size))
    random.Random(random_seed).shuffle(indices)
    return sorted(indices[:sample_count])


def resolve_token_lengths(config: PipelineConfig) -> tuple[int, int]:
    """Resolve input and target token lengths from configuration or tokenizer analysis."""

    if config.data.max_input_length is not None:
        max_input_length = config.data.max_input_length
    else:
        analysis_config = TokenizerAnalysisConfig(
            cleaned_dataset_path=config.data.cleaned_dataset_path,
            model_name=config.model.tokenizer_name,
        )
        analysis_result = TokenizerAnalyzer(analysis_config).analyze()
        max_input_length = analysis_result.recommended_max_input_length

    max_target_length = config.data.max_target_length if config.data.max_target_length is not None else max_input_length
    return max_input_length, max_target_length


def decode_label_sequence(tokenizer: AutoTokenizer, label_ids: list[int]) -> str:
    """Decode a label sequence while preserving padded positions."""

    decoded_ids = [token_id if token_id != -100 else tokenizer.pad_token_id for token_id in label_ids]
    return tokenizer.decode(decoded_ids, skip_special_tokens=True, clean_up_tokenization_spaces=True)


def validate_tensor_batch(batch: dict[str, torch.Tensor]) -> None:
    """Validate tensor shapes and finite values before the forward pass."""

    required_keys = ("input_ids", "attention_mask", "labels")
    missing_keys = [key for key in required_keys if key not in batch]
    if missing_keys:
        raise ValueError(f"Missing batch tensors: {missing_keys}")

    input_shape = batch["input_ids"].shape
    attention_shape = batch["attention_mask"].shape
    label_shape = batch["labels"].shape

    if input_shape != attention_shape or input_shape != label_shape:
        raise ValueError(
            f"Tensor shape mismatch: input_ids={input_shape}, attention_mask={attention_shape}, labels={label_shape}"
        )

    for name, tensor in batch.items():
        if tensor.is_floating_point() and not torch.isfinite(tensor).all():
            raise ValueError(f"Non-finite values detected in {name}.")


def validate_model_outputs(outputs: object) -> None:
    """Validate model outputs for non-finite tensors."""

    loss = getattr(outputs, "loss", None)
    if loss is not None and loss.is_floating_point() and not torch.isfinite(loss):
        raise ValueError("Loss contains non-finite values.")

    logits = getattr(outputs, "logits", None)
    if logits is not None and logits.is_floating_point() and not torch.isfinite(logits).all():
        raise ValueError("Logits contain non-finite values.")


def print_sample_details(
    tokenizer: AutoTokenizer,
    raw_samples: list[dict[str, str]],
    tokenized_samples: list[dict[str, list[int]]],
) -> None:
    """Print the requested details for each selected sample."""

    for index, (raw_sample, tokenized_sample) in enumerate(zip(raw_samples, tokenized_samples), start=1):
        prompt = f"fix grammar: {raw_sample['source']}"
        decoded_input = tokenizer.decode(tokenized_sample["input_ids"], skip_special_tokens=True, clean_up_tokenization_spaces=True)
        decoded_labels = decode_label_sequence(tokenizer, tokenized_sample["labels"])

        print(f"Sample {index}:")
        print(f"Original sentence: {raw_sample['source']}")
        print(f"Target sentence: {raw_sample['target']}")
        print(f"Prompt: {prompt}")
        print(f"Decoded tokenized input: {decoded_input}")
        print(f"Decoded labels: {decoded_labels}")
        print("-")


def build_tensor_batch(tokenized_samples: list[dict[str, list[int]]], device: torch.device) -> dict[str, torch.Tensor]:
    """Convert tokenized sample dictionaries into a PyTorch batch."""

    batch = {
        "input_ids": torch.tensor([sample["input_ids"] for sample in tokenized_samples], dtype=torch.long, device=device),
        "attention_mask": torch.tensor([sample["attention_mask"] for sample in tokenized_samples], dtype=torch.long, device=device),
        "labels": torch.tensor([sample["labels"] for sample in tokenized_samples], dtype=torch.long, device=device),
    }
    validate_tensor_batch(batch)
    return batch


def format_memory_usage() -> tuple[str, str]:
    """Format current CUDA memory usage if CUDA is available."""

    allocated = torch.cuda.memory_allocated() / (1024 ** 2)
    reserved = torch.cuda.memory_reserved() / (1024 ** 2)
    return f"{allocated:.2f} MB", f"{reserved:.2f} MB"


def configure_utf8_stdout() -> None:
    """Make stdout UTF-8 friendly on Windows consoles when possible."""

    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        LOGGER.debug("Could not reconfigure stdout encoding", exc_info=True)


def run_sanity_check(config: PipelineConfig, sample_count: int) -> int:
    """Execute the end-to-end sanity check and return an exit code."""

    LOGGER.info("Loading tokenizer and dataset configuration")
    max_input_length, max_target_length = resolve_token_lengths(config)
    pretrained_kwargs = {"cache_dir": config.model.cache_dir} if config.model.cache_dir is not None else {}
    dataset_builder = GrammarDatasetBuilder(
        DatasetBuilderConfig(
            cleaned_dataset_path=config.data.cleaned_dataset_path,
            source_column=config.data.source_column,
            target_column=config.data.target_column,
            random_seed=config.data.random_seed,
        )
    )
    dataset_dict = dataset_builder.build()

    tokenizer = AutoTokenizer.from_pretrained(config.model.tokenizer_name, use_fast=True, **pretrained_kwargs)
    tokenization_config = TokenizationConfig(
        model_name=config.model.tokenizer_name,
        max_input_length=max_input_length,
        max_target_length=max_target_length,
        source_column=config.data.source_column,
        target_column=config.data.target_column,
    )
    tokenized_dataset = GrammarTokenizer(tokenization_config).tokenize_dataset(dataset_dict)

    model = AutoModelForSeq2SeqLM.from_pretrained(config.model.model_name, **pretrained_kwargs)
    cuda_available = torch.cuda.is_available()
    device = torch.device("cuda" if cuda_available else "cpu")
    model.to(device)
    model.eval()

    training_split = tokenized_dataset["train"]
    raw_training_split = dataset_dict["train"]
    selected_indices = select_sample_indices(len(training_split), sample_count, config.data.random_seed)

    raw_samples = [
        {"source": raw_training_split[index]["source"], "target": raw_training_split[index]["target"]}
        for index in selected_indices
    ]
    tokenized_samples = [training_split[index] for index in selected_indices]

    print_sample_details(tokenizer, raw_samples, tokenized_samples)

    batch = build_tensor_batch(tokenized_samples, device)
    LOGGER.info("Input tensor shape: %s", tuple(batch["input_ids"].shape))
    LOGGER.info("Label tensor shape: %s", tuple(batch["labels"].shape))

    try:
        with torch.inference_mode():
            outputs = model(
                input_ids=batch["input_ids"],
                attention_mask=batch["attention_mask"],
                labels=batch["labels"],
            )
    except Exception:
        LOGGER.exception("Forward pass failed")
        return 1

    if outputs.loss is None:
        LOGGER.error("Model did not return a loss value.")
        return 1

    try:
        validate_model_outputs(outputs)
    except ValueError:
        LOGGER.exception("Invalid tensors detected in model outputs")
        return 1

    total_parameters = sum(parameter.numel() for parameter in model.parameters())
    trainable_parameters = sum(parameter.numel() for parameter in model.parameters() if parameter.requires_grad)

    gpu_name = torch.cuda.get_device_name(0) if cuda_available else "CPU"
    allocated_memory, reserved_memory = ("0.00 MB", "0.00 MB")
    if cuda_available:
        allocated_memory, reserved_memory = format_memory_usage()

    print(f"Loss: {outputs.loss.item():.6f}")
    print(f"Loss finite: {torch.isfinite(outputs.loss).item()}")
    print(f"Input tensor shapes: input_ids={tuple(batch['input_ids'].shape)}, attention_mask={tuple(batch['attention_mask'].shape)}")
    print(f"Label tensor shapes: labels={tuple(batch['labels'].shape)}")
    print(f"Total model parameters: {total_parameters}")
    print(f"Trainable parameters: {trainable_parameters}")
    print(f"CUDA available: {cuda_available}")
    print(f"GPU name: {gpu_name}")
    print(f"GPU memory allocated: {allocated_memory}")
    print(f"GPU memory reserved: {reserved_memory}")
    print("✅ Sanity check passed. Ready for training.")
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    """Run the sanity check from the command line."""

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    configure_utf8_stdout()
    parser = build_sanity_argument_parser()
    args = parser.parse_args(argv)

    pipeline_config = build_pipeline_config(args)
    if args.sample_count < 1:
        LOGGER.error("sample-count must be at least 1")
        return 1

    try:
        return run_sanity_check(pipeline_config, args.sample_count)
    except Exception:
        LOGGER.exception("Sanity check failed")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
