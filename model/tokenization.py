"""Tokenize the cleaned sentence-pair dataset for FLAN-T5 training prep."""

from __future__ import annotations

import argparse
import logging
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

from datasets import DatasetDict
from transformers import AutoTokenizer

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from model.dataset import DatasetBuilderConfig, GrammarDatasetBuilder
from model.tokenizer_analysis import TokenizerAnalysisConfig, TokenizerAnalyzer
from model.utils import resolve_project_path


LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class TokenizationConfig:
    """Configuration for tokenization."""

    model_name: str = "google/flan-t5-small"
    max_input_length: int = 128
    max_target_length: int = 128
    source_column: str = "source"
    target_column: str = "target"
    prefix: str = "fix grammar: "
    padding: str = "max_length"
    truncation: bool = True


class GrammarTokenizer:
    """Tokenize grammar correction sentence pairs for seq2seq training."""

    def __init__(self, config: TokenizationConfig) -> None:
        self.config = config
        self.tokenizer = AutoTokenizer.from_pretrained(config.model_name, use_fast=True)

    def tokenize_dataset(self, dataset_dict: DatasetDict) -> DatasetDict:
        """Tokenize every split of a DatasetDict."""

        remove_columns = list(dataset_dict["train"].column_names)
        return dataset_dict.map(self._tokenize_batch, batched=True, remove_columns=remove_columns)

    def _tokenize_batch(self, examples: dict[str, list[str]]) -> dict[str, list[list[int]]]:
        inputs = [f"{self.config.prefix}{sentence}" for sentence in examples[self.config.source_column]]
        targets = examples[self.config.target_column]

        model_inputs = self.tokenizer(
            inputs,
            max_length=self.config.max_input_length,
            padding=self.config.padding,
            truncation=self.config.truncation,
        )
        label_batch = self.tokenizer(
            text_target=targets,
            max_length=self.config.max_target_length,
            padding=self.config.padding,
            truncation=self.config.truncation,
        )
        labels = label_batch["input_ids"]
        if self.tokenizer.pad_token_id is not None:
            labels = [
                [token_id if token_id != self.tokenizer.pad_token_id else -100 for token_id in sequence]
                for sequence in labels
            ]

        model_inputs["labels"] = labels
        return model_inputs


def build_argument_parser() -> argparse.ArgumentParser:
    """Create CLI arguments for tokenization."""

    parser = argparse.ArgumentParser(description="Tokenize the cleaned dataset for training preparation.")
    parser.add_argument("--cleaned-dataset", type=Path, default=None, help="Path to the cleaned CSV dataset.")
    parser.add_argument("--max-input-length", type=int, default=None, help="Maximum input token length.")
    parser.add_argument("--max-target-length", type=int, default=None, help="Maximum target token length.")
    parser.add_argument("--model-name", type=str, default=None, help="Tokenizer model name.")
    return parser


def create_config(args: argparse.Namespace) -> TokenizationConfig:
    """Build a tokenization configuration from CLI arguments."""

    default_analysis_config = TokenizerAnalysisConfig()
    analysis_config = TokenizerAnalysisConfig(
        cleaned_dataset_path=args.cleaned_dataset or default_analysis_config.cleaned_dataset_path,
        model_name=args.model_name or default_analysis_config.model_name,
        report_path=default_analysis_config.report_path,
        histogram_path=default_analysis_config.histogram_path,
        source_column=default_analysis_config.source_column,
        target_column=default_analysis_config.target_column,
        thresholds=default_analysis_config.thresholds,
        percentile_for_recommendation=default_analysis_config.percentile_for_recommendation,
        length_rounding_multiple=default_analysis_config.length_rounding_multiple,
        max_length_cap=default_analysis_config.max_length_cap,
    )
    analysis_result = TokenizerAnalyzer(analysis_config).analyze()

    return TokenizationConfig(
        model_name=analysis_config.model_name,
        max_input_length=args.max_input_length if args.max_input_length is not None else analysis_result.recommended_max_input_length,
        max_target_length=args.max_target_length if args.max_target_length is not None else analysis_result.recommended_max_input_length,
    )


def main(argv: Sequence[str] | None = None) -> int:
    """Tokenize the cleaned dataset and report split sizes."""

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    parser = build_argument_parser()
    args = parser.parse_args(argv)

    cleaned_dataset_path = args.cleaned_dataset or Path("datasets/processed/train_clean_cleaned.csv")
    tokenizer_config = create_config(args)
    dataset_dict = GrammarDatasetBuilder(DatasetBuilderConfig(cleaned_dataset_path=cleaned_dataset_path)).build()
    tokenized_dataset = GrammarTokenizer(tokenizer_config).tokenize_dataset(dataset_dict)
    LOGGER.info(
        "Tokenized dataset splits: train=%d, validation=%d, test=%d",
        len(tokenized_dataset["train"]),
        len(tokenized_dataset["validation"]),
        len(tokenized_dataset["test"]),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
