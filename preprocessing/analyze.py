"""Dataset analysis utilities for grammar correction sentence pairs."""

from __future__ import annotations

import argparse
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

try:
    from preprocessing.utils import (
        combined_length_summary,
        combined_vocabulary_size,
        count_replacement_pairs,
        discover_default_dataset_path,
        duplicate_row_count,
        duplicate_sentence_pair_count,
        ensure_directory,
        infer_sentence_pair_columns,
        resolve_output_path,
        resolve_project_path,
        sentence_lengths,
        vocabulary_size,
    )
except ModuleNotFoundError:
    from utils import (
        combined_length_summary,
        combined_vocabulary_size,
        count_replacement_pairs,
        discover_default_dataset_path,
        duplicate_row_count,
        duplicate_sentence_pair_count,
        ensure_directory,
        infer_sentence_pair_columns,
        resolve_output_path,
        resolve_project_path,
        sentence_lengths,
        vocabulary_size,
    )


LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class AnalyzerConfig:
    """Configuration for dataset analysis."""

    input_path: Path
    output_dir: Path
    source_column: str | None = None
    target_column: str | None = None
    top_n_replacements: int = 20
    report_filename: str = "dataset_report.txt"


class DatasetAnalyzer:
    """Generate statistics, plots, and edit-frequency reports for a dataset."""

    def __init__(self, config: AnalyzerConfig) -> None:
        self.config = config

    def load_dataset(self) -> pd.DataFrame:
        """Load the dataset from disk."""

        return pd.read_csv(self.config.input_path)

    def analyze(self) -> tuple[Path, list[Path]]:
        """Run the full analysis pipeline and write all outputs to disk."""

        dataframe = self.load_dataset()
        source_column, target_column = infer_sentence_pair_columns(
            dataframe,
            source_column=self.config.source_column,
            target_column=self.config.target_column,
        )

        LOGGER.info("Detected sentence columns: %s -> %s", source_column, target_column)

        output_dir = ensure_directory(self.config.output_dir)
        report_path = output_dir / self.config.report_filename
        plot_paths = self._generate_plots(dataframe, source_column, target_column, output_dir)
        report_text = self._build_report(dataframe, source_column, target_column)
        report_path.write_text(report_text, encoding="utf-8")
        return report_path, plot_paths

    def _generate_plots(
        self,
        dataframe: pd.DataFrame,
        source_column: str,
        target_column: str,
        output_dir: Path,
    ) -> list[Path]:
        source_word_counts, source_character_counts = sentence_lengths(dataframe, source_column)
        target_word_counts, target_character_counts = sentence_lengths(dataframe, target_column)

        word_plot_path = output_dir / "word_count_distribution.png"
        character_plot_path = output_dir / "character_count_distribution.png"

        self._plot_distribution(
            [source_word_counts, target_word_counts],
            ["source", "target"],
            "Word Count Distribution",
            "Word Count",
            word_plot_path,
        )
        self._plot_distribution(
            [source_character_counts, target_character_counts],
            ["source", "target"],
            "Character Count Distribution",
            "Character Count",
            character_plot_path,
        )
        return [word_plot_path, character_plot_path]

    @staticmethod
    def _plot_distribution(
        series_list: list[list[int]],
        labels: list[str],
        title: str,
        x_label: str,
        output_path: Path,
    ) -> None:
        plt.figure(figsize=(10, 6))
        for values, label in zip(series_list, labels):
            sns.histplot(values, bins=min(40, max(5, len(set(values)) or 5)), kde=False, stat="count", label=label, alpha=0.55)

        plt.title(title)
        plt.xlabel(x_label)
        plt.ylabel("Frequency")
        plt.legend()
        plt.tight_layout()
        plt.savefig(output_path, dpi=150)
        plt.close()

    def _build_report(self, dataframe: pd.DataFrame, source_column: str, target_column: str) -> str:
        source_word_counts, source_character_counts = sentence_lengths(dataframe, source_column)
        target_word_counts, target_character_counts = sentence_lengths(dataframe, target_column)

        combined_word_counts = source_word_counts + target_word_counts
        combined_character_counts = source_character_counts + target_character_counts

        source_non_missing = dataframe[source_column].notna()
        target_non_missing = dataframe[target_column].notna()
        missing_source = int((~source_non_missing).sum())
        missing_target = int((~target_non_missing).sum())
        missing_total = missing_source + missing_target

        empty_source = int((dataframe[source_column].fillna("").astype(str).str.strip() == "").sum())
        empty_target = int((dataframe[target_column].fillna("").astype(str).str.strip() == "").sum())

        unchanged_pairs = int((dataframe[source_column].fillna("").astype(str) == dataframe[target_column].fillna("").astype(str)).sum())
        changed_pairs = int(len(dataframe) - unchanged_pairs)

        source_vocab = vocabulary_size(dataframe, source_column)
        target_vocab = vocabulary_size(dataframe, target_column)
        source_summary = combined_length_summary(source_word_counts)
        target_summary = combined_length_summary(target_word_counts)
        combined_summary = combined_length_summary(combined_word_counts)

        replacements = count_replacement_pairs(
            dataframe[source_column].fillna("").astype(str).tolist(),
            dataframe[target_column].fillna("").astype(str).tolist(),
        )

        report_lines = [
            "Dataset Report",
            "==============",
            f"Input file: {self.config.input_path}",
            f"Rows: {len(dataframe)}",
            f"Duplicate rows: {duplicate_row_count(dataframe)}",
            f"Duplicate sentence pairs: {duplicate_sentence_pair_count(dataframe, source_column, target_column)}",
            f"Missing values: {missing_total}",
            f"Missing source values: {missing_source}",
            f"Missing target values: {missing_target}",
            f"Empty strings: source={empty_source}, target={empty_target}",
            f"Unchanged pairs: {unchanged_pairs}",
            f"Changed pairs: {changed_pairs}",
            "",
            "Sentence Length Statistics",
            "--------------------------",
            f"Source words - avg: {source_summary.average:.2f}, median: {source_summary.median:.2f}, min: {source_summary.minimum}, max: {source_summary.maximum}",
            f"Target words - avg: {target_summary.average:.2f}, median: {target_summary.median:.2f}, min: {target_summary.minimum}, max: {target_summary.maximum}",
            f"Combined words - avg: {combined_summary.average:.2f}, median: {combined_summary.median:.2f}, min: {combined_summary.minimum}, max: {combined_summary.maximum}",
            f"Source characters - avg: {pd.Series(source_character_counts).mean():.2f}, median: {pd.Series(source_character_counts).median():.2f}, min: {min(source_character_counts) if source_character_counts else 0}, max: {max(source_character_counts) if source_character_counts else 0}",
            f"Target characters - avg: {pd.Series(target_character_counts).mean():.2f}, median: {pd.Series(target_character_counts).median():.2f}, min: {min(target_character_counts) if target_character_counts else 0}, max: {max(target_character_counts) if target_character_counts else 0}",
            f"Combined characters - avg: {pd.Series(combined_character_counts).mean():.2f}, median: {pd.Series(combined_character_counts).median():.2f}, min: {min(combined_character_counts) if combined_character_counts else 0}, max: {max(combined_character_counts) if combined_character_counts else 0}",
            "",
            "Vocabulary Size",
            "---------------",
            f"Source vocabulary: {source_vocab}",
            f"Target vocabulary: {target_vocab}",
            f"Combined vocabulary: {combined_vocabulary_size(dataframe, source_column, target_column)}",
            "",
            "Top Edit Statistics",
            "-------------------",
        ]

        if replacements:
            for (source_token, target_token), count in replacements.most_common(self.config.top_n_replacements):
                report_lines.append(f"{source_token} -> {target_token}: {count}")
        else:
            report_lines.append("No replacement edits detected.")

        report_lines.append("")
        report_lines.append(f"Top replacements shown: {min(self.config.top_n_replacements, len(replacements))}")
        return "\n".join(report_lines)


def build_argument_parser() -> argparse.ArgumentParser:
    """Create the analyzer CLI parser."""

    parser = argparse.ArgumentParser(description="Analyze a grammar correction dataset.")
    parser.add_argument("--input", type=Path, default=None, help="Path to the CSV dataset.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("reports"),
        help="Directory for the report and plots.",
    )
    parser.add_argument("--source-column", type=str, default=None, help="Name of the source sentence column.")
    parser.add_argument("--target-column", type=str, default=None, help="Name of the target sentence column.")
    parser.add_argument(
        "--top-n-replacements",
        type=int,
        default=20,
        help="Number of replacement pairs to include in the report.",
    )
    return parser


def create_config(args: argparse.Namespace) -> AnalyzerConfig:
    """Build an analyzer configuration from command line arguments."""

    input_path = resolve_project_path(args.input) if args.input else discover_default_dataset_path()
    return AnalyzerConfig(
        input_path=input_path,
        output_dir=resolve_project_path(args.output_dir),
        source_column=args.source_column,
        target_column=args.target_column,
        top_n_replacements=args.top_n_replacements,
    )


def main(argv: Sequence[str] | None = None) -> int:
    """Run dataset analysis from the command line."""

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    parser = build_argument_parser()
    args = parser.parse_args(argv)

    config = create_config(args)
    analyzer = DatasetAnalyzer(config)

    LOGGER.info("Analyzing dataset: %s", config.input_path)
    report_path, plot_paths = analyzer.analyze()
    LOGGER.info("Saved report to %s", report_path)
    for plot_path in plot_paths:
        LOGGER.info("Saved plot to %s", plot_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())