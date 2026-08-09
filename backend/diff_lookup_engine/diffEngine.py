from __future__ import annotations

from dataclasses import asdict, dataclass
import difflib
import re
from typing import Literal

ChangeType = Literal["changed", "added", "deleted"]


@dataclass(frozen=True, slots=True)
class Token:
    """A word/token and its character position in the sentence."""

    text: str
    start: int
    end: int


@dataclass(frozen=True, slots=True)
class Difference:
    """A single difference between the original and corrected text."""

    type: ChangeType

    original: str
    corrected: str

    original_start: int
    original_end: int

    corrected_start: int
    corrected_end: int

    def to_dict(self) -> dict:
        """Convert the difference to a JSON-friendly dictionary."""
        return asdict(self)


class DifferenceLookup:
    """Compare two strings and identify word-level differences."""

    # Words, including contractions and hyphenated words.
    TOKEN_PATTERN = re.compile(
        r"[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*(?:-[A-Za-z0-9]+)*"
    )

    def compare(self, original: str, corrected: str) -> list[dict]:
        """
        Compare original and corrected text.

        Returns:
            A list of differences containing:
            - changed words
            - added words
            - deleted words
            - character positions in both strings
        """

        original_tokens = self._tokenize(original)
        corrected_tokens = self._tokenize(corrected)

        original_words = [token.text.lower() for token in original_tokens]
        corrected_words = [token.text.lower() for token in corrected_tokens]

        matcher = difflib.SequenceMatcher(
            None,
            original_words,
            corrected_words,
            autojunk=False,
        )

        differences: list[Difference] = []

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "equal":
                continue

            original_chunk = original_tokens[i1:i2]
            corrected_chunk = corrected_tokens[j1:j2]

            if tag == "replace":
                differences.extend(
                    self._build_replacements(
                        original_chunk,
                        corrected_chunk,
                    )
                )

            elif tag == "delete":
                differences.extend(
                    self._build_deletions(original_chunk)
                )

            elif tag == "insert":
                differences.extend(
                    self._build_additions(corrected_chunk)
                )

        return [difference.to_dict() for difference in differences]

    def _tokenize(self, text: str) -> list[Token]:
        """Extract words while preserving their character positions."""

        return [
            Token(
                text=match.group(),
                start=match.start(),
                end=match.end(),
            )
            for match in self.TOKEN_PATTERN.finditer(text)
        ]

    def _build_replacements(
        self,
        original_tokens: list[Token],
        corrected_tokens: list[Token],
    ) -> list[Difference]:
        """Build changed/add/delete differences for a replacement block."""

        differences: list[Difference] = []

        pair_count = min(
            len(original_tokens),
            len(corrected_tokens),
        )

        # Pair words that occupy corresponding positions.
        for index in range(pair_count):
            original = original_tokens[index]
            corrected = corrected_tokens[index]

            differences.append(
                Difference(
                    type="changed",
                    original=original.text,
                    corrected=corrected.text,
                    original_start=original.start,
                    original_end=original.end,
                    corrected_start=corrected.start,
                    corrected_end=corrected.end,
                )
            )

        # Extra original words were deleted.
        for token in original_tokens[pair_count:]:
            differences.append(
                Difference(
                    type="deleted",
                    original=token.text,
                    corrected="",
                    original_start=token.start,
                    original_end=token.end,
                    corrected_start=0,
                    corrected_end=0,
                )
            )

        # Extra corrected words were added.
        for token in corrected_tokens[pair_count:]:
            differences.append(
                Difference(
                    type="added",
                    original="",
                    corrected=token.text,
                    original_start=0,
                    original_end=0,
                    corrected_start=token.start,
                    corrected_end=token.end,
                )
            )

        return differences

    def _build_deletions(
        self,
        tokens: list[Token],
    ) -> list[Difference]:
        """Build differences for deleted words."""

        return [
            Difference(
                type="deleted",
                original=token.text,
                corrected="",
                original_start=token.start,
                original_end=token.end,
                corrected_start=0,
                corrected_end=0,
            )
            for token in tokens
        ]

    def _build_additions(
        self,
        tokens: list[Token],
    ) -> list[Difference]:
        """Build differences for added words."""

        return [
            Difference(
                type="added",
                original="",
                corrected=token.text,
                original_start=0,
                original_end=0,
                corrected_start=token.start,
                corrected_end=token.end,
            )
            for token in tokens
        ]


def compare_texts(original: str, corrected: str) -> list[dict]:
    """Convenience function for comparing two strings."""

    return DifferenceLookup().compare(original, corrected)

