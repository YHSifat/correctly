"""Build Hugging Face datasets from the cleaned grammar correction CSV."""

from __future__ import annotations

import argparse
import logging
import math
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

import pandas as pd
from datasets import Dataset, DatasetDict

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from model.utils import resolve_project_path, standardize_sentence_pair_dataframe


LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class DatasetBuilderConfig:
    """Configuration for dataset building and splitting."""

    cleaned_dataset_path: Path = Path("datasets/processed/train_clean_cleaned.csv")
    source_column: str = "source"
    target_column: str = "target"
    train_ratio: float = 0.8
    validation_ratio: float = 0.1
    test_ratio: float = 0.1
    random_seed: int = 42


class GrammarDatasetBuilder:
    """Create train/validation/test splits from the cleaned CSV dataset."""

    def __init__(self, config: DatasetBuilderConfig) -> None:
        self.config = config

    def load_cleaned_csv(self) -> pd.DataFrame:
        """Load the cleaned CSV file."""

        return pd.read_csv(resolve_project_path(self.config.cleaned_dataset_path))

    def build(self) -> DatasetDict:
        """Load, standardize, split, and convert to a DatasetDict."""

        self._validate_split_ratios()
        dataframe = self.load_cleaned_csv()
        standardized = standardize_sentence_pair_dataframe(
            dataframe,
            source_column=self.config.source_column,
            target_column=self.config.target_column,
        )

        dataset = Dataset.from_pandas(standardized, preserve_index=False)
        holdout_size = self.config.validation_ratio + self.config.test_ratio
        split = dataset.train_test_split(test_size=holdout_size, seed=self.config.random_seed)
        validation_test = split["test"].train_test_split(
            test_size=self.config.test_ratio / holdout_size,
            seed=self.config.random_seed,
        )

        return DatasetDict(
            train=split["train"],
            validation=validation_test["train"],
            test=validation_test["test"],
        )

    def _validate_split_ratios(self) -> None:
        if not math.isclose(
            self.config.train_ratio + self.config.validation_ratio + self.config.test_ratio,
            1.0,
            rel_tol=0.0,
            abs_tol=1e-9,
        ):
            raise ValueError("Train, validation, and test ratios must sum to 1.0.")


def build_argument_parser() -> argparse.ArgumentParser:
    """Create CLI arguments for dataset building."""

    parser = argparse.ArgumentParser(description="Build a Hugging Face DatasetDict from the cleaned dataset.")
    parser.add_argument("--cleaned-dataset", type=Path, default=None, help="Path to the cleaned CSV dataset.")
    parser.add_argument("--random-seed", type=int, default=None, help="Random seed used for splitting.")
    return parser


def create_config(args: argparse.Namespace) -> DatasetBuilderConfig:
    """Build a dataset builder configuration from CLI arguments."""

    default_config = DatasetBuilderConfig()
    return DatasetBuilderConfig(
        cleaned_dataset_path=args.cleaned_dataset or default_config.cleaned_dataset_path,
        source_column=default_config.source_column,
        target_column=default_config.target_column,
        train_ratio=default_config.train_ratio,
        validation_ratio=default_config.validation_ratio,
        test_ratio=default_config.test_ratio,
        random_seed=args.random_seed if args.random_seed is not None else default_config.random_seed,
    )


def main(argv: Sequence[str] | None = None) -> int:
    """Build the dataset and print the split sizes."""

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    parser = build_argument_parser()
    args = parser.parse_args(argv)
    config = create_config(args)

    dataset_dict = GrammarDatasetBuilder(config).build()
    LOGGER.info(
        "Built dataset splits: train=%d, validation=%d, test=%d",
        len(dataset_dict["train"]),
        len(dataset_dict["validation"]),
        len(dataset_dict["test"]),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
