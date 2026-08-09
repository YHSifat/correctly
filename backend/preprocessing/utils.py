"""Shared utilities for preprocessing grammar correction datasets."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from difflib import SequenceMatcher
import re
import unicodedata
from pathlib import Path
from typing import Iterable, Sequence

import pandas as pd


QUOTE_TRANSLATION_TABLE = str.maketrans(
    {
        "\u2018": "'",
        "\u2019": "'",
        "\u201A": "'",
        "\u201B": "'",
        "\u2032": "'",
        "\u2035": "'",
        "\u201C": '"',
        "\u201D": '"',
        "\u201E": '"',
        "\u201F": '"',
    }
)

ANNOTATION_TOKEN_PATTERN = re.compile(r"(?<!\S)(?:-NONE-|<unk>|NULL)(?!\S)")
WORD_PATTERN = re.compile(r"[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*")

SOURCE_COLUMN_CANDIDATES = (
    "source",
    "input_text",
    "original_sentence",
    "ungrammatical_statement",
    "sentence_with_error",
    "incorrect_sentence",
    "error_sentence",
)
TARGET_COLUMN_CANDIDATES = (
    "target",
    "corrected_sentence",
    "standard_english",
    "output_text",
    "clean_sentence",
    "grammar_correct_sentence",
    "correct_sentence",
)
DEFAULT_RAW_DATASET_PREFERENCES = (
    Path("datasets/raw/train_clean.csv"),
)


PROJECT_ROOT = Path(__file__).resolve().parent.parent


@dataclass(frozen=True)
class LengthSummary:
    """Sentence length summary statistics."""

    average: float
    median: float
    minimum: int
    maximum: int


def ensure_directory(path: Path) -> Path:
    """Create a directory if it does not already exist."""

    path.mkdir(parents=True, exist_ok=True)
    return path


def resolve_project_path(path: Path) -> Path:
    """Resolve a path relative to the project root when needed."""

    if path.is_absolute():
        return path
    return PROJECT_ROOT / path


def discover_default_dataset_path() -> Path:
    """Return a sensible default raw dataset path."""

    for candidate in DEFAULT_RAW_DATASET_PREFERENCES:
        resolved_candidate = resolve_project_path(candidate)
        if resolved_candidate.exists():
            return resolved_candidate

    raise FileNotFoundError("No CSV dataset found in datasets/raw.")


def resolve_output_path(input_path: Path, output_dir: Path, output_filename: str | None = None) -> Path:
    """Build the destination path for a processed dataset."""

    output_dir = resolve_project_path(output_dir)
    ensure_directory(output_dir)
    if output_filename:
        return output_dir / output_filename
    return output_dir / f"{input_path.stem}_cleaned.csv"


def infer_sentence_pair_columns(
    dataframe: pd.DataFrame,
    source_column: str | None = None,
    target_column: str | None = None,
) -> tuple[str, str]:
    """Infer or validate the sentence pair columns in a dataset."""

    columns = {column.lower(): column for column in dataframe.columns}

    if source_column and target_column:
        if source_column not in dataframe.columns or target_column not in dataframe.columns:
            raise ValueError(f"Columns {source_column!r} and {target_column!r} were not found in the dataset.")
        return source_column, target_column

    for source_candidate in SOURCE_COLUMN_CANDIDATES:
        source_match = columns.get(source_candidate)
        if source_match is None:
            continue
        for target_candidate in TARGET_COLUMN_CANDIDATES:
            target_match = columns.get(target_candidate)
            if target_match is not None:
                return source_match, target_match

    if len(dataframe.columns) >= 2:
        return dataframe.columns[0], dataframe.columns[1]

    raise ValueError("Unable to infer sentence pair columns from the dataset.")


def normalize_quotes(text: str) -> str:
    """Convert curly quotes to standard ASCII quotes."""

    return text.translate(QUOTE_TRANSLATION_TABLE)


def normalize_whitespace(text: str) -> str:
    """Collapse multiple whitespace characters and strip the result."""

    return re.sub(r"\s+", " ", text).strip()


def remove_annotation_artifacts(text: str) -> str:
    """Remove known annotation tokens without touching valid words."""

    cleaned_text = ANNOTATION_TOKEN_PATTERN.sub("", text)
    return normalize_whitespace(cleaned_text)


def normalize_sentence(value: object) -> str:
    """Apply the cleaning steps used by the dataset cleaner."""

    if pd.isna(value):
        return ""

    text = unicodedata.normalize("NFKC", str(value))
    text = normalize_quotes(text)
    text = remove_annotation_artifacts(text)
    text = normalize_whitespace(text)
    return text


def word_tokens(text: str) -> list[str]:
    """Tokenize a sentence into word-like tokens for statistics."""

    return WORD_PATTERN.findall(text.lower())


def sentence_lengths(dataframe: pd.DataFrame, column: str) -> tuple[list[int], list[int]]:
    """Return word-count and character-count lists for a sentence column."""

    sentences = dataframe[column].fillna("").astype(str)
    word_counts = [len(word_tokens(sentence)) for sentence in sentences]
    character_counts = [len(sentence) for sentence in sentences]
    return word_counts, character_counts


def combined_length_summary(word_counts: Iterable[int]) -> LengthSummary:
    """Build summary statistics from sentence length counts."""

    counts = list(word_counts)
    if not counts:
        return LengthSummary(average=0.0, median=0.0, minimum=0, maximum=0)

    series = pd.Series(counts)
    return LengthSummary(
        average=float(series.mean()),
        median=float(series.median()),
        minimum=int(series.min()),
        maximum=int(series.max()),
    )


def vocabulary_size(dataframe: pd.DataFrame, column: str) -> int:
    """Count unique word tokens in a sentence column."""

    vocabulary = set()
    for sentence in dataframe[column].fillna("").astype(str):
        vocabulary.update(word_tokens(sentence))
    return len(vocabulary)


def combined_vocabulary_size(dataframe: pd.DataFrame, source_column: str, target_column: str) -> int:
    """Count unique word tokens across the source and target columns."""

    vocabulary = set()
    for sentence in dataframe[source_column].fillna("").astype(str):
        vocabulary.update(word_tokens(sentence))
    for sentence in dataframe[target_column].fillna("").astype(str):
        vocabulary.update(word_tokens(sentence))
    return len(vocabulary)


def count_replacement_pairs(
    source_sentences: Sequence[str],
    target_sentences: Sequence[str],
) -> Counter[tuple[str, str]]:
    """Count word-level replacements across aligned sentence pairs."""

    replacements: Counter[tuple[str, str]] = Counter()
    for source_sentence, target_sentence in zip(source_sentences, target_sentences):
        source_tokens = word_tokens(source_sentence)
        target_tokens = word_tokens(target_sentence)
        matcher = SequenceMatcher(a=source_tokens, b=target_tokens)
        for tag, source_start, source_end, target_start, target_end in matcher.get_opcodes():
            if tag != "replace":
                continue

            source_block = source_tokens[source_start:source_end]
            target_block = target_tokens[target_start:target_end]
            for source_token, target_token in zip(source_block, target_block):
                replacements[(source_token, target_token)] += 1

    return replacements


def duplicate_sentence_pair_count(dataframe: pd.DataFrame, source_column: str, target_column: str) -> int:
    """Count duplicate sentence pairs in a dataframe."""

    return int(dataframe.duplicated(subset=[source_column, target_column]).sum())


def duplicate_row_count(dataframe: pd.DataFrame) -> int:
    """Count duplicate rows in a dataframe."""

    return int(dataframe.duplicated().sum())
