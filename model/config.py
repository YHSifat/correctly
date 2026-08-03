"""Configuration dataclasses for training preparation."""

from __future__ import annotations

import argparse
from dataclasses import dataclass, field, replace
from pathlib import Path
from typing import Sequence


@dataclass(slots=True)
class ModelConfig:
    """Model and tokenizer configuration."""

    model_name: str = "google/flan-t5-small"
    tokenizer_name: str = "google/flan-t5-small"
    cache_dir: Path | None = None


@dataclass(slots=True)
class DataConfig:
    """Data and preprocessing configuration."""

    cleaned_dataset_path: Path = Path("datasets/processed/train_clean_cleaned.csv")
    source_column: str = "source"
    target_column: str = "target"
    max_input_length: int | None = None
    max_target_length: int | None = None
    random_seed: int = 42


@dataclass(slots=True)
class TrainingConfig:
    """Training arguments configuration."""

    batch_size: int = 4
    learning_rate: float = 5e-5
    epochs: int = 3
    weight_decay: float = 0.01
    gradient_accumulation_steps: int = 1
    fp16: bool = False
    random_seed: int = 42
    output_dir: Path = Path("models/flan_t5_small_gec")
    logging_dir: Path = Path("reports/training_logs")
    save_total_limit: int | None = 2
    evaluation_strategy: str = "no"
    save_strategy: str = "no"
    logging_steps: int = 50


@dataclass(slots=True)
class PipelineConfig:
    """Top-level configuration for the training preparation pipeline."""

    model: ModelConfig = field(default_factory=ModelConfig)
    data: DataConfig = field(default_factory=DataConfig)
    training: TrainingConfig = field(default_factory=TrainingConfig)


def build_argument_parser() -> argparse.ArgumentParser:
    """Create CLI arguments for the training prep pipeline."""

    parser = argparse.ArgumentParser(description="Prepare the FLAN-T5 training pipeline without training the model.")
    parser.add_argument("--cleaned-dataset", type=Path, default=None, help="Path to the cleaned CSV dataset.")
    parser.add_argument("--model-name", type=str, default="google/flan-t5-small", help="Model and tokenizer name.")
    parser.add_argument("--batch-size", type=int, default=None, help="Per-device batch size.")
    parser.add_argument("--learning-rate", type=float, default=None, help="Learning rate.")
    parser.add_argument("--epochs", type=int, default=None, help="Number of epochs.")
    parser.add_argument("--weight-decay", type=float, default=None, help="Weight decay.")
    parser.add_argument("--gradient-accumulation-steps", type=int, default=None, help="Gradient accumulation steps.")
    parser.add_argument("--fp16", action="store_true", help="Enable fp16 training arguments.")
    parser.add_argument("--random-seed", type=int, default=None, help="Random seed.")
    parser.add_argument("--output-dir", type=Path, default=None, help="Model output directory.")
    parser.add_argument("--logging-dir", type=Path, default=None, help="Training logs directory.")
    parser.add_argument("--save-total-limit", type=int, default=None, help="Maximum number of checkpoints to keep.")
    parser.add_argument("--evaluation-strategy", type=str, default=None, help="Evaluation strategy passed to TrainingArguments.")
    parser.add_argument("--save-strategy", type=str, default=None, help="Checkpoint save strategy passed to TrainingArguments.")
    parser.add_argument("--max-input-length", type=int, default=None, help="Maximum input token length.")
    parser.add_argument("--max-target-length", type=int, default=None, help="Maximum target token length.")
    return parser


def build_pipeline_config(args: argparse.Namespace) -> PipelineConfig:
    """Convert parsed CLI arguments into a pipeline config."""

    default_config = PipelineConfig()
    model_config = replace(default_config.model, model_name=args.model_name, tokenizer_name=args.model_name)
    data_config = replace(
        default_config.data,
        cleaned_dataset_path=args.cleaned_dataset or default_config.data.cleaned_dataset_path,
        max_input_length=args.max_input_length if args.max_input_length is not None else default_config.data.max_input_length,
        max_target_length=args.max_target_length if args.max_target_length is not None else default_config.data.max_target_length,
        random_seed=args.random_seed if args.random_seed is not None else default_config.data.random_seed,
    )
    training_config = replace(
        default_config.training,
        batch_size=args.batch_size if args.batch_size is not None else default_config.training.batch_size,
        learning_rate=args.learning_rate if args.learning_rate is not None else default_config.training.learning_rate,
        epochs=args.epochs if args.epochs is not None else default_config.training.epochs,
        weight_decay=args.weight_decay if args.weight_decay is not None else default_config.training.weight_decay,
        gradient_accumulation_steps=args.gradient_accumulation_steps if args.gradient_accumulation_steps is not None else default_config.training.gradient_accumulation_steps,
        fp16=args.fp16,
        random_seed=args.random_seed if args.random_seed is not None else default_config.training.random_seed,
        output_dir=args.output_dir or default_config.training.output_dir,
        logging_dir=args.logging_dir or default_config.training.logging_dir,
        save_total_limit=args.save_total_limit if args.save_total_limit is not None else default_config.training.save_total_limit,
        evaluation_strategy=args.evaluation_strategy if args.evaluation_strategy is not None else default_config.training.evaluation_strategy,
        save_strategy=args.save_strategy if args.save_strategy is not None else default_config.training.save_strategy,
    )
    return PipelineConfig(model=model_config, data=data_config, training=training_config)


def main(argv: Sequence[str] | None = None) -> int:
    """Print the default configuration summary."""

    parser = build_argument_parser()
    args = parser.parse_args(argv)
    config = build_pipeline_config(args)
    print(config)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
