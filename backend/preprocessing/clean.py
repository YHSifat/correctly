"""Dataset cleaning pipeline for grammar correction sentence pairs."""

from __future__ import annotations

import argparse
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

import pandas as pd

try:
	from preprocessing.utils import (
		discover_default_dataset_path,
		ensure_directory,
		infer_sentence_pair_columns,
		normalize_sentence,
		resolve_output_path,
		resolve_project_path,
	)
except ModuleNotFoundError:
	from utils import (
		discover_default_dataset_path,
		ensure_directory,
		infer_sentence_pair_columns,
		normalize_sentence,
		resolve_output_path,
		resolve_project_path,
	)


LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class CleanerConfig:
	"""Configuration for the dataset cleaning pipeline."""

	input_path: Path
	output_dir: Path
	source_column: str | None = None
	target_column: str | None = None
	output_filename: str | None = None


class DataCleaner:
	"""Clean grammar correction datasets while preserving valid sentence pairs."""

	def __init__(self, config: CleanerConfig) -> None:
		self.config = config

	def load_dataset(self) -> pd.DataFrame:
		"""Load the raw dataset from disk."""

		return pd.read_csv(self.config.input_path)

	def clean(self) -> tuple[pd.DataFrame, Path]:
		"""Run the cleaning pipeline and save the cleaned dataset."""

		dataframe = self.load_dataset()
		source_column, target_column = infer_sentence_pair_columns(
			dataframe,
			source_column=self.config.source_column,
			target_column=self.config.target_column,
		)

		LOGGER.info("Detected sentence columns: %s -> %s", source_column, target_column)

		cleaned = self._apply_cleaning_pipeline(dataframe, source_column, target_column)
		output_path = resolve_output_path(
			input_path=self.config.input_path,
			output_dir=self.config.output_dir,
			output_filename=self.config.output_filename,
		)
		ensure_directory(output_path.parent)
		cleaned.to_csv(output_path, index=False)
		return cleaned, output_path

	def _apply_cleaning_pipeline(
		self,
		dataframe: pd.DataFrame,
		source_column: str,
		target_column: str,
	) -> pd.DataFrame:
		frame = dataframe.copy()

		frame[source_column] = frame[source_column].apply(normalize_sentence)
		frame[target_column] = frame[target_column].apply(normalize_sentence)

		frame = self._remove_invalid_rows(frame, source_column, target_column)
		frame = self._remove_duplicate_sentence_pairs(frame, source_column, target_column)

		if source_column != "source" or target_column != "target":
			frame = frame.rename(columns={source_column: "source", target_column: "target"})

		return frame.reset_index(drop=True)

	@staticmethod
	def _remove_invalid_rows(
		dataframe: pd.DataFrame,
		source_column: str,
		target_column: str,
	) -> pd.DataFrame:
		frame = dataframe.copy()
		frame = frame.dropna(subset=[source_column, target_column])
		frame = frame[
			frame[source_column].astype(str).str.strip().ne("")
			& frame[target_column].astype(str).str.strip().ne("")
		]
		return frame

	@staticmethod
	def _remove_duplicate_sentence_pairs(
		dataframe: pd.DataFrame,
		source_column: str,
		target_column: str,
	) -> pd.DataFrame:
		return dataframe.drop_duplicates(subset=[source_column, target_column], keep="first")


def build_argument_parser() -> argparse.ArgumentParser:
	"""Create the command line interface for the cleaner."""

	parser = argparse.ArgumentParser(description="Clean a grammar correction dataset.")
	parser.add_argument("--input", type=Path, default=None, help="Path to the raw CSV dataset.")
	parser.add_argument(
		"--output-dir",
		type=Path,
		default=Path("datasets/processed"),
		help="Directory for the cleaned dataset.",
	)
	parser.add_argument("--source-column", type=str, default=None, help="Name of the source sentence column.")
	parser.add_argument("--target-column", type=str, default=None, help="Name of the target sentence column.")
	parser.add_argument(
		"--output-filename",
		type=str,
		default=None,
		help="Optional filename for the cleaned dataset.",
	)
	return parser


def create_config(args: argparse.Namespace) -> CleanerConfig:
	"""Build a cleaner configuration from parsed arguments."""

	input_path = resolve_project_path(args.input) if args.input else discover_default_dataset_path()
	output_dir = resolve_project_path(args.output_dir)
	return CleanerConfig(
		input_path=input_path,
		output_dir=output_dir,
		source_column=args.source_column,
		target_column=args.target_column,
		output_filename=args.output_filename,
	)


def main(argv: Sequence[str] | None = None) -> int:
	"""Run the cleaning pipeline from the command line."""

	logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
	parser = build_argument_parser()
	args = parser.parse_args(argv)

	config = create_config(args)
	cleaner = DataCleaner(config)

	LOGGER.info("Cleaning dataset: %s", config.input_path)
	cleaned, output_path = cleaner.clean()
	LOGGER.info("Saved cleaned dataset to %s (%d rows)", output_path, len(cleaned))
	return 0


if __name__ == "__main__":
	raise SystemExit(main())
