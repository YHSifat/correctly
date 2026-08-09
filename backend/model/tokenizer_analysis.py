"""Tokenizer length analysis for the cleaned grammar correction dataset."""

from __future__ import annotations

import argparse
import logging
import math
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Sequence

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from transformers import AutoTokenizer

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from model.utils import ensure_parent_directory, resolve_project_path, standardize_sentence_pair_dataframe


LOGGER = logging.getLogger(__name__)
TOKEN_LENGTH_THRESHOLDS = (64, 128, 256, 512)


@dataclass(slots=True)
class TokenizerAnalysisConfig:
    """Configuration for tokenizer analysis."""

    cleaned_dataset_path: Path = Path("datasets/processed/train_clean_cleaned.csv")
    model_name: str = "google/flan-t5-small"
    report_path: Path = Path("reports/tokenizer_report.txt")
    histogram_path: Path = Path("reports/token_length_histogram.png")
    source_column: str = "source"
    target_column: str = "target"
    thresholds: tuple[int, ...] = TOKEN_LENGTH_THRESHOLDS
    percentile_for_recommendation: float = 95.0
    length_rounding_multiple: int = 8
    max_length_cap: int = 512


@dataclass(slots=True)
class TokenLengthStatistics:
    """Summary statistics for token lengths."""

    average_length: float
    median_length: float
    maximum_length: int
    minimum_length: int
    percent_exceeding: dict[int, float] = field(default_factory=dict)


@dataclass(slots=True)
class TokenizerAnalysisResult:
    """Structured output from tokenizer analysis."""

    input_stats: TokenLengthStatistics
    target_stats: TokenLengthStatistics
    recommended_max_input_length: int
    report_path: Path
    histogram_path: Path


class TokenizerAnalyzer:
    """Analyze token lengths for the cleaned grammar correction dataset."""

    def __init__(self, config: TokenizerAnalysisConfig) -> None:
        self.config = config
        self.tokenizer = AutoTokenizer.from_pretrained(config.model_name, use_fast=True)

    def load_dataset(self) -> pd.DataFrame:
        """Load the cleaned dataset from disk."""

        return pd.read_csv(resolve_project_path(self.config.cleaned_dataset_path))

    def analyze(self) -> TokenizerAnalysisResult:
        """Run the tokenizer analysis and save the report and histogram."""

        dataframe = self.load_dataset()
        standardized = standardize_sentence_pair_dataframe(
            dataframe,
            source_column=self.config.source_column,
            target_column=self.config.target_column,
        )

        input_lengths = self._compute_input_lengths(standardized["source"].tolist())
        target_lengths = self._compute_target_lengths(standardized["target"].tolist())

        input_stats = self._build_statistics(input_lengths)
        target_stats = self._build_statistics(target_lengths)
        recommended_input_length = self._recommend_length(input_lengths)

        report_path = resolve_project_path(self.config.report_path)
        histogram_path = resolve_project_path(self.config.histogram_path)
        ensure_parent_directory(report_path)
        ensure_parent_directory(histogram_path)
        report_path.write_text(
            self._build_report(
                input_stats=input_stats,
                target_stats=target_stats,
                recommended_max_input_length=recommended_input_length,
            ),
            encoding="utf-8",
        )
        self._save_histogram(input_lengths, target_lengths, histogram_path)

        return TokenizerAnalysisResult(
            input_stats=input_stats,
            target_stats=target_stats,
            recommended_max_input_length=recommended_input_length,
            report_path=report_path,
            histogram_path=histogram_path,
        )

    def _compute_input_lengths(self, sentences: list[str]) -> list[int]:
        prefixed_sentences = [f"fix grammar: {sentence}" for sentence in sentences]
        encodings = self.tokenizer(prefixed_sentences, add_special_tokens=True, padding=False, truncation=False)
        return [len(token_ids) for token_ids in encodings["input_ids"]]

    def _compute_target_lengths(self, sentences: list[str]) -> list[int]:
        encodings = self.tokenizer(text_target=sentences, add_special_tokens=True, padding=False, truncation=False)
        return [len(token_ids) for token_ids in encodings["input_ids"]]

    def _build_statistics(self, lengths: list[int]) -> TokenLengthStatistics:
        length_array = np.asarray(lengths, dtype=np.int64)
        percent_exceeding = {
            threshold: float((length_array > threshold).mean() * 100.0)
            for threshold in self.config.thresholds
        }
        return TokenLengthStatistics(
            average_length=float(length_array.mean()),
            median_length=float(np.median(length_array)),
            maximum_length=int(length_array.max()),
            minimum_length=int(length_array.min()),
            percent_exceeding=percent_exceeding,
        )

    def _recommend_length(self, lengths: list[int]) -> int:
        percentile_value = int(np.ceil(np.percentile(np.asarray(lengths, dtype=np.int64), self.config.percentile_for_recommendation)))
        rounded = int(math.ceil(percentile_value / self.config.length_rounding_multiple) * self.config.length_rounding_multiple)
        return max(64, min(self.config.max_length_cap, rounded))

    def _save_histogram(self, input_lengths: list[int], target_lengths: list[int], output_path: Path) -> None:
        figure, axes = plt.subplots(1, 2, figsize=(14, 5), sharey=True)

        axes[0].hist(input_lengths, bins=50, color="#1f77b4", alpha=0.8)
        axes[0].set_title("Input Token Lengths")
        axes[0].set_xlabel("Tokens")
        axes[0].set_ylabel("Frequency")

        axes[1].hist(target_lengths, bins=50, color="#ff7f0e", alpha=0.8)
        axes[1].set_title("Target Token Lengths")
        axes[1].set_xlabel("Tokens")

        for threshold in self.config.thresholds:
            axes[0].axvline(threshold, color="gray", linestyle="--", linewidth=1)
            axes[1].axvline(threshold, color="gray", linestyle="--", linewidth=1)

        figure.suptitle("Token Length Distribution")
        figure.tight_layout()
        figure.savefig(output_path, dpi=150)
        plt.close(figure)

    def _build_report(
        self,
        input_stats: TokenLengthStatistics,
        target_stats: TokenLengthStatistics,
        recommended_max_input_length: int,
    ) -> str:
        lines = [
            "Tokenizer Analysis Report",
            "========================",
            f"Model: {self.config.model_name}",
            f"Cleaned dataset: {resolve_project_path(self.config.cleaned_dataset_path)}",
            "",
            "Input Token Statistics",
            "----------------------",
            f"Average input token length: {input_stats.average_length:.2f}",
            f"Median input token length: {input_stats.median_length:.2f}",
            f"Maximum input token length: {input_stats.maximum_length}",
            f"Minimum input token length: {input_stats.minimum_length}",
        ]
        for threshold, percentage in input_stats.percent_exceeding.items():
            lines.append(f"Input lengths exceeding {threshold} tokens: {percentage:.2f}%")

        lines.extend([
            "",
            "Target Token Statistics",
            "-----------------------",
            f"Average target token length: {target_stats.average_length:.2f}",
            f"Median target token length: {target_stats.median_length:.2f}",
            f"Maximum target token length: {target_stats.maximum_length}",
            f"Minimum target token length: {target_stats.minimum_length}",
        ])
        for threshold, percentage in target_stats.percent_exceeding.items():
            lines.append(f"Target lengths exceeding {threshold} tokens: {percentage:.2f}%")

        lines.extend([
            "",
            "Recommendation",
            "--------------",
            f"Recommended max_input_length: {recommended_max_input_length}",
            "Recommendation basis: 95th percentile rounded up to the nearest 8 tokens, capped at 512.",
            "",
            f"Report file: {resolve_project_path(self.config.report_path)}",
            f"Histogram file: {resolve_project_path(self.config.histogram_path)}",
        ])
        return "\n".join(lines)


def build_argument_parser() -> argparse.ArgumentParser:
    """Create CLI arguments for tokenizer analysis."""

    parser = argparse.ArgumentParser(description="Analyze tokenizer lengths for the cleaned dataset.")
    parser.add_argument("--cleaned-dataset", type=Path, default=None, help="Path to the cleaned CSV dataset.")
    parser.add_argument("--model-name", type=str, default=None, help="Tokenizer model name.")
    parser.add_argument("--report-path", type=Path, default=None, help="Report output path.")
    parser.add_argument("--histogram-path", type=Path, default=None, help="Histogram output path.")
    return parser


def create_config(args: argparse.Namespace) -> TokenizerAnalysisConfig:
    """Build a tokenizer analysis configuration from CLI arguments."""

    default_config = TokenizerAnalysisConfig()
    return TokenizerAnalysisConfig(
        cleaned_dataset_path=args.cleaned_dataset or default_config.cleaned_dataset_path,
        model_name=args.model_name or default_config.model_name,
        report_path=args.report_path or default_config.report_path,
        histogram_path=args.histogram_path or default_config.histogram_path,
        source_column=default_config.source_column,
        target_column=default_config.target_column,
        thresholds=default_config.thresholds,
        percentile_for_recommendation=default_config.percentile_for_recommendation,
        length_rounding_multiple=default_config.length_rounding_multiple,
        max_length_cap=default_config.max_length_cap,
    )


def main(argv: Sequence[str] | None = None) -> int:
    """Execute tokenizer analysis from the command line."""

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    parser = build_argument_parser()
    args = parser.parse_args(argv)
    config = create_config(args)

    LOGGER.info("Analyzing token lengths for %s", resolve_project_path(config.cleaned_dataset_path))
    result = TokenizerAnalyzer(config).analyze()
    LOGGER.info("Saved report to %s", result.report_path)
    LOGGER.info("Saved histogram to %s", result.histogram_path)
    LOGGER.info("Recommended max_input_length: %d", result.recommended_max_input_length)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
