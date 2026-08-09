"""Grammar error lookup engine."""

from __future__ import annotations

from grammar_rule_engine.rules import (
    DEFAULT_RULES,
    GrammarMatch,
    GrammarRule,
)


class GrammarLookup:
    """Run grammar rules against differences."""

    def __init__(
        self,
        rules: tuple[GrammarRule, ...] = DEFAULT_RULES,
    ) -> None:
        self.rules = rules

    def lookup(
        self,
        original: str,
        corrected: str,
        differences: list[dict],
    ) -> list[dict]:
        """
        Add grammar information to detected differences.

        The difference engine remains responsible for identifying
        what changed. This engine only attempts to explain why.
        """

        results = []

        for difference in differences:
            match = self._find_best_match(
                original,
                corrected,
                difference,
            )

            result = dict(difference)

            if match is not None:
                result.update(
                    {
                        "error_type": match.error_type,
                        "explanation": match.explanation,
                        "confidence": match.confidence,
                    }
                )
            else:
                result.update(
                    {
                        "error_type": None,
                        "explanation": None,
                        "confidence": 0.0,
                    }
                )

            results.append(result)

        return results

    def _find_best_match(
        self,
        original: str,
        corrected: str,
        difference: dict,
    ) -> GrammarMatch | None:

        matches: list[GrammarMatch] = []

        for rule in self.rules:
            match = rule.check(
                original,
                corrected,
                difference,
            )

            if match is not None:
                matches.append(match)

        if not matches:
            return None

        return max(
            matches,
            key=lambda match: match.confidence,
        )