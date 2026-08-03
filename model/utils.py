"""Shared utilities for model training preparation."""

from __future__ import annotations

from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]

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
    "target_text",
)


def resolve_project_path(path: Path | str | None) -> Path:
    """Resolve a path relative to the repository root when needed."""

    if path is None:
        return PROJECT_ROOT

    resolved = Path(path)
    if resolved.is_absolute():
        return resolved
    return PROJECT_ROOT / resolved


def ensure_directory(path: Path) -> Path:
    """Create a directory and return it."""

    path.mkdir(parents=True, exist_ok=True)
    return path


def ensure_parent_directory(path: Path) -> Path:
    """Create a file's parent directory and return the path."""

    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def infer_sentence_pair_columns(
    dataframe: pd.DataFrame,
    source_column: str | None = None,
    target_column: str | None = None,
) -> tuple[str, str]:
    """Infer the source and target sentence columns from a dataframe."""

    available_columns = {column.lower(): column for column in dataframe.columns}

    if source_column and target_column:
        if source_column not in dataframe.columns or target_column not in dataframe.columns:
            raise ValueError(f"Columns {source_column!r} and {target_column!r} were not found in the dataset.")
        return source_column, target_column

    for source_candidate in SOURCE_COLUMN_CANDIDATES:
        source_match = available_columns.get(source_candidate)
        if source_match is None:
            continue
        for target_candidate in TARGET_COLUMN_CANDIDATES:
            target_match = available_columns.get(target_candidate)
            if target_match is not None:
                return source_match, target_match

    if len(dataframe.columns) >= 2:
        return dataframe.columns[0], dataframe.columns[1]

    raise ValueError("Unable to infer sentence pair columns from the dataset.")


def standardize_sentence_pair_dataframe(
    dataframe: pd.DataFrame,
    source_column: str | None = None,
    target_column: str | None = None,
) -> pd.DataFrame:
    """Return a cleaned two-column dataframe with source and target text."""

    source_name, target_name = infer_sentence_pair_columns(
        dataframe,
        source_column=source_column,
        target_column=target_column,
    )

    standardized = dataframe[[source_name, target_name]].copy()
    standardized = standardized.dropna(subset=[source_name, target_name])
    standardized = standardized.rename(columns={source_name: "source", target_name: "target"})
    standardized["source"] = standardized["source"].astype(str).str.strip()
    standardized["target"] = standardized["target"].astype(str).str.strip()
    standardized = standardized[(standardized["source"] != "") & (standardized["target"] != "")]
    return standardized.reset_index(drop=True)
