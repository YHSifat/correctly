"""Grammar rules used by the grammar lookup engine."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
import re


@dataclass(frozen=True, slots=True)
class GrammarMatch:
    """Result returned when a grammar rule identifies an error."""

    error_type: str
    explanation: str
    confidence: float


class GrammarRule(ABC):
    """Base class for all grammar lookup rules."""

    name: str = ""

    @abstractmethod
    def check(
        self,
        original: str,
        corrected: str,
        difference: dict,
    ) -> GrammarMatch | None:
        """Return a grammar match or None if the rule does not apply."""
        raise NotImplementedError


class SubjectVerbAgreementRule(GrammarRule):
    """Detect common subject-verb agreement errors."""

    name = "subject_verb_agreement"

    VERB_PAIRS = {
        "am": {"is", "are"},
        "is": {"am", "are"},
        "are": {"am", "is"},
        "was": {"were"},
        "were": {"was"},
        "go": {"goes"},
        "goes": {"go"},
        "do": {"does"},
        "does": {"do"},
        "have": {"has"},
        "has": {"have"},
        "run": {"runs"},
        "runs": {"run"},
        "eat": {"eats"},
        "eats": {"eat"},
        "work": {"works"},
        "works": {"work"},
        "play": {"plays"},
        "plays": {"play"},
        "like": {"likes"},
        "likes": {"like"},
    }

    FIRST_PERSON_SINGULAR = {"i"}

    SECOND_PERSON = {"you"}

    SINGULAR_SUBJECTS = {
        "he",
        "she",
        "it",
        "this",
        "that",
        "someone",
        "everyone",
        "everybody",
        "nobody",
    }

    PLURAL_SUBJECTS = {
        "they",
        "we",
        "these",
        "those",
    }

    def check(
        self,
        original: str,
        corrected: str,
        difference: dict,
    ) -> GrammarMatch | None:

        if difference.get("type") != "changed":
            return None

        old_word = difference["original"].lower()
        new_word = difference["corrected"].lower()

        if new_word not in self.VERB_PAIRS.get(old_word, set()):
            return None

        subject = self._find_subject(
            original,
            difference["original_start"],
        )

        if subject is None:
            return None

        subject_lower = subject.lower()

        expected = self._expected_verb(
            subject_lower,
            old_word,
            new_word,
        )

        if expected != new_word:
            return None

        return GrammarMatch(
            error_type=self.name,
            explanation=(
                f"The subject '{subject}' requires the verb "
                f"'{difference['corrected']}' instead of "
                f"'{difference['original']}'."
            ),
            confidence=0.95,
        )

    def _expected_verb(
        self,
        subject: str,
        old_word: str,
        new_word: str,
    ) -> str | None:

        # I → am
        if subject in self.FIRST_PERSON_SINGULAR:
            if old_word == "are":
                return "am"

            if old_word == "is":
                return "am"

            return None

        # You → are
        if subject in self.SECOND_PERSON:
            if old_word in {"am", "is"}:
                return "are"

            return None

        # He / she / it → is
        if subject in self.SINGULAR_SUBJECTS:
            if old_word in {"am", "are"}:
                return "is"

            if old_word == "go":
                return "goes"

            if old_word == "do":
                return "does"

            if old_word == "have":
                return "has"

            if old_word in {"run", "eat", "work", "play", "like"}:
                return f"{old_word}s"

            if old_word == "were":
                return "was"

        # We / they → are
        if subject in self.PLURAL_SUBJECTS:
            if old_word in {"am", "is"}:
                return "are"

            if old_word == "goes":
                return "go"

            if old_word == "does":
                return "do"

            if old_word == "has":
                return "have"

            if old_word in {
                "runs",
                "eats",
                "works",
                "plays",
                "likes",
            }:
                return old_word[:-1]

            if old_word == "was":
                return "were"

        return None

    def _find_subject(
        self,
        sentence: str,
        difference_start: int,
    ) -> str | None:
        """Find a simple subject before the changed verb."""

        before = sentence[:difference_start]

        words = re.findall(
            r"[A-Za-z]+(?:['’][A-Za-z]+)?",
            before,
        )

        if not words:
            return None

        # For now, look at the closest five words.
        candidate_subjects = (
            self.FIRST_PERSON_SINGULAR
            | self.SECOND_PERSON
            | self.SINGULAR_SUBJECTS
            | self.PLURAL_SUBJECTS
        )

        for word in reversed(words[-5:]):
            if word.lower() in candidate_subjects:
                return word

        return None

class ArticleUsageRule(GrammarRule):
    """Detect incorrect article usage."""

    name = "article_usage"

    ARTICLES = {"a", "an", "the"}

    def check(
        self,
        original: str,
        corrected: str,
        difference: dict,
    ) -> GrammarMatch | None:

        difference_type = difference.get("type")

        # We only care about articles being added or changed.
        if difference_type not in {"added", "changed"}:
            return None

        corrected_article = difference["corrected"].lower()

        if corrected_article not in self.ARTICLES:
            return None

        original_article = difference.get("original", "").lower()

        # For a changed article, make sure the original
        # word was also an article.
        if difference_type == "changed":
            if original_article not in self.ARTICLES:
                return None

            # If the article didn't actually change, ignore it.
            if original_article == corrected_article:
                return None

        # Try to find the noun immediately after the corrected article.
        noun = self._find_following_word(
            corrected,
            difference["corrected_end"],
        )

        if noun:
            explanation = (
                f"Use '{difference['corrected']}' before '{noun}'."
            )
        else:
            explanation = (
                f"Use '{difference['corrected']}' here."
            )

        return GrammarMatch(
            error_type=self.name,
            explanation=explanation,
            confidence=0.95,
        )

    def _find_following_word(
        self,
        sentence: str,
        position: int,
    ) -> str | None:
        """Find the next word after the changed article."""

        remaining = sentence[position:]

        match = re.search(
            r"[A-Za-z]+(?:['’][A-Za-z]+)?",
            remaining,
        )

        if match is None:
            return None

        return match.group(0)

class VerbFormRule(GrammarRule):
    """Detect common irregular verb-form corrections."""

    name = "verb_form"

    VERB_FORMS = {
        ("went", "gone"),
        ("ate", "eaten"),
        ("saw", "seen"),
        ("took", "taken"),
        ("wrote", "written"),
        ("spoke", "spoken"),
        ("gave", "given"),
        ("did", "done"),
    }

    def check(
        self,
        original: str,
        corrected: str,
        difference: dict,
    ) -> GrammarMatch | None:

        if difference.get("type") != "changed":
            return None

        old_word = difference["original"].lower()
        new_word = difference["corrected"].lower()

        if (old_word, new_word) not in self.VERB_FORMS:
            return None

        return GrammarMatch(
            error_type=self.name,
            explanation=(
                f"'{difference['original']}' is not the correct "
                f"verb form here. The corrected form is "
                f"'{difference['corrected']}'."
            ),
            confidence=0.80,
        )


 




class VerbTenseRule(GrammarRule):
    """
    Detect common verb tense/form corrections using the
    original and corrected local context.
    """

    name = "verb_tense"

    # Irregular verb forms.
    IRREGULAR_VERBS = {
        "be": {
            "present": {"am", "is", "are"},
            "past": {"was", "were"},
            "participle": {"been"},
            "continuous": {"being"},
        },
        "have": {
            "present": {"have", "has"},
            "past": {"had"},
            "participle": {"had"},
            "continuous": {"having"},
        },
        "do": {
            "present": {"do", "does"},
            "past": {"did"},
            "participle": {"done"},
            "continuous": {"doing"},
        },
        "go": {
            "present": {"go", "goes"},
            "past": {"went"},
            "participle": {"gone"},
            "continuous": {"going"},
        },
        "see": {
            "present": {"see", "sees"},
            "past": {"saw"},
            "participle": {"seen"},
            "continuous": {"seeing"},
        },
        "get": {
            "present": {"get", "gets"},
            "past": {"got"},
            "participle": {"got", "gotten"},
            "continuous": {"getting"},
        },
        "run": {
            "present": {"run", "runs"},
            "past": {"ran"},
            "participle": {"run"},
            "continuous": {"running"},
        },
        "come": {
            "present": {"come", "comes"},
            "past": {"came"},
            "participle": {"come"},
            "continuous": {"coming"},
        },
        "take": {
            "present": {"take", "takes"},
            "past": {"took"},
            "participle": {"taken"},
            "continuous": {"taking"},
        },
        "make": {
            "present": {"make", "makes"},
            "past": {"made"},
            "participle": {"made"},
            "continuous": {"making"},
        },
        "write": {
            "present": {"write", "writes"},
            "past": {"wrote"},
            "participle": {"written"},
            "continuous": {"writing"},
        },
        "read": {
            "present": {"read", "reads"},
            "past": {"read"},
            "participle": {"read"},
            "continuous": {"reading"},
        },
        "eat": {
            "present": {"eat", "eats"},
            "past": {"ate"},
            "participle": {"eaten"},
            "continuous": {"eating"},
        },
        "drink": {
            "present": {"drink", "drinks"},
            "past": {"drank"},
            "participle": {"drunk"},
            "continuous": {"drinking"},
        },
        "give": {
            "present": {"give", "gives"},
            "past": {"gave"},
            "participle": {"given"},
            "continuous": {"giving"},
        },
        "find": {
            "present": {"find", "finds"},
            "past": {"found"},
            "participle": {"found"},
            "continuous": {"finding"},
        },
        "think": {
            "present": {"think", "thinks"},
            "past": {"thought"},
            "participle": {"thought"},
            "continuous": {"thinking"},
        },
        "know": {
            "present": {"know", "knows"},
            "past": {"knew"},
            "participle": {"known"},
            "continuous": {"knowing"},
        },
        "say": {
            "present": {"say", "says"},
            "past": {"said"},
            "participle": {"said"},
            "continuous": {"saying"},
        },
        "tell": {
            "present": {"tell", "tells"},
            "past": {"told"},
            "participle": {"told"},
            "continuous": {"telling"},
        },
        "give": {
            "present": {"give", "gives"},
            "past": {"gave"},
            "participle": {"given"},
            "continuous": {"giving"},
        },
        "find": {
            "present": {"find", "finds"},
            "past": {"found"},
            "participle": {"found"},
            "continuous": {"finding"},
        },
        "feel": {
            "present": {"feel", "feels"},
            "past": {"felt"},
            "participle": {"felt"},
            "continuous": {"feeling"},
        },
        "leave": {
            "present": {"leave", "leaves"},
            "past": {"left"},
            "participle": {"left"},
            "continuous": {"leaving"},
        },
        "bring": {
            "present": {"bring", "brings"},
            "past": {"brought"},
            "participle": {"brought"},
            "continuous": {"bringing"},
        },
        "buy": {
            "present": {"buy", "buys"},
            "past": {"bought"},
            "participle": {"bought"},
            "continuous": {"buying"},
        },
        "keep": {
            "present": {"keep", "keeps"},
            "past": {"kept"},
            "participle": {"kept"},
            "continuous": {"keeping"},
        },
        "sleep": {
            "present": {"sleep", "sleeps"},
            "past": {"slept"},
            "participle": {"slept"},
            "continuous": {"sleeping"},
        },
        "speak": {
            "present": {"speak", "speaks"},
            "past": {"spoke"},
            "participle": {"spoken"},
            "continuous": {"speaking"},
        },
        "write": {
            "present": {"write", "writes"},
            "past": {"wrote"},
            "participle": {"written"},
            "continuous": {"writing"},
        },
        "drive": {
            "present": {"drive", "drives"},
            "past": {"drove"},
            "participle": {"driven"},
            "continuous": {"driving"},
        },
        "choose": {
            "present": {"choose", "chooses"},
            "past": {"chose"},
            "participle": {"chosen"},
            "continuous": {"choosing"},
        },
        "break": {
            "present": {"break", "breaks"},
            "past": {"broke"},
            "participle": {"broken"},
            "continuous": {"breaking"},
        },
        "begin": {
            "present": {"begin", "begins"},
            "past": {"began"},
            "participle": {"begun"},
            "continuous": {"beginning"},
        },
        "become": {
            "present": {"become", "becomes"},
            "past": {"became"},
            "participle": {"become"},
            "continuous": {"becoming"},
        },
        "fall": {
            "present": {"fall", "falls"},
            "past": {"fell"},
            "participle": {"fallen"},
            "continuous": {"falling"},
        },
        "forget": {
            "present": {"forget", "forgets"},
            "past": {"forgot"},
            "participle": {"forgotten"},
            "continuous": {"forgetting"},
        },
        "grow": {
            "present": {"grow", "grows"},
            "past": {"grew"},
            "participle": {"grown"},
            "continuous": {"growing"},
        },
        "hear": {
            "present": {"hear", "hears"},
            "past": {"heard"},
            "participle": {"heard"},
            "continuous": {"hearing"},
        },
        "hold": {
            "present": {"hold", "holds"},
            "past": {"held"},
            "participle": {"held"},
            "continuous": {"holding"},
        },
        "lose": {
            "present": {"lose", "loses"},
            "past": {"lost"},
            "participle": {"lost"},
            "continuous": {"losing"},
        },
        "meet": {
            "present": {"meet", "meets"},
            "past": {"met"},
            "participle": {"met"},
            "continuous": {"meeting"},
        },
        "pay": {
            "present": {"pay", "pays"},
            "past": {"paid"},
            "participle": {"paid"},
            "continuous": {"paying"},
        },
        "put": {
            "present": {"put", "puts"},
            "past": {"put"},
            "participle": {"put"},
            "continuous": {"putting"},
        },
        "sell": {
            "present": {"sell", "sells"},
            "past": {"sold"},
            "participle": {"sold"},
            "continuous": {"selling"},
        },
        "send": {
            "present": {"send", "sends"},
            "past": {"sent"},
            "participle": {"sent"},
            "continuous": {"sending"},
        },
        "sit": {
            "present": {"sit", "sits"},
            "past": {"sat"},
            "participle": {"sat"},
            "continuous": {"sitting"},
        },
        "stand": {
            "present": {"stand", "stands"},
            "past": {"stood"},
            "participle": {"stood"},
            "continuous": {"standing"},
        },
        "teach": {
            "present": {"teach", "teaches"},
            "past": {"taught"},
            "participle": {"taught"},
            "continuous": {"teaching"},
        },
        "understand": {
            "present": {"understand", "understands"},
            "past": {"understood"},
            "participle": {"understood"},
            "continuous": {"understanding"},
        },
        "wear": {
            "present": {"wear", "wears"},
            "past": {"wore"},
            "participle": {"worn"},
            "continuous": {"wearing"},
        },
        "win": {
            "present": {"win", "wins"},
            "past": {"won"},
            "participle": {"won"},
            "continuous": {"winning"},
        },
    }

    # Common regular verbs where morphology is predictable.
    REGULAR_VERBS = {
        "accept",
        "add",
        "agree",
        "allow",
        "answer",
        "appear",
        "arrive",
        "ask",
        "believe",
        "call",
        "change",
        "clean",
        "close",
        "compare",
        "complete",
        "continue",
        "cook",
        "create",
        "dance",
        "decide",
        "describe",
        "develop",
        "discover",
        "discuss",
        "enjoy",
        "enter",
        "explain",
        "finish",
        "follow",
        "happen",
        "help",
        "hope",
        "imagine",
        "improve",
        "include",
        "invite",
        "join",
        "jump",
        "laugh",
        "learn",
        "like",
        "listen",
        "live",
        "look",
        "love",
        "manage",
        "miss",
        "move",
        "need",
        "notice",
        "offer",
        "open",
        "order",
        "paint",
        "pass",
        "plan",
        "play",
        "practice",
        "prepare",
        "promise",
        "provide",
        "reach",
        "receive",
        "remember",
        "remove",
        "repeat",
        "return",
        "save",
        "search",
        "seem",
        "share",
        "smile",
        "start",
        "stay",
        "stop",
        "study",
        "talk",
        "travel",
        "try",
        "turn",
        "use",
        "visit",
        "wait",
        "walk",
        "want",
        "wash",
        "watch",
        "work",
        "worry",
    }

    def _normalise(self, word: str) -> str:
        return word.lower().strip(".,!?;:\"'")

    def _is_verb_pair(self, original: str, corrected: str) -> bool:
        original = self._normalise(original)
        corrected = self._normalise(corrected)

        if original == corrected:
            return False

        # Check irregular verbs.
        for forms in self.IRREGULAR_VERBS.values():
            all_forms = set().union(*forms.values())
            if original in all_forms and corrected in all_forms:
                return True

        # Check regular verbs.
        if original in self.REGULAR_VERBS:
            return True

        if corrected in self.REGULAR_VERBS:
            return True

        # Common regular endings.
        regular_endings = (
            "ed",
            "ing",
            "s",
        )

        if (
            original.endswith(regular_endings)
            or corrected.endswith(regular_endings)
        ):
            return True

        return False

    def _detect_pattern(
        self,
        original_tokens: list[str],
        corrected_tokens: list[str],
        index: int,
    ) -> tuple[str, str, float] | None:

        original = self._normalise(original_tokens[index])
        corrected = self._normalise(corrected_tokens[index])

        # -----------------------------------------
        # Simple present → simple past
        # -----------------------------------------
        for forms in self.IRREGULAR_VERBS.values():
            if original in forms["present"] and corrected in forms["past"]:
                return (
                    "simple_present_to_simple_past",
                    "The verb was changed from present tense to past tense.",
                    0.95,
                )

        # -----------------------------------------
        # Simple past → simple present
        # -----------------------------------------
        for forms in self.IRREGULAR_VERBS.values():
            if original in forms["past"] and corrected in forms["present"]:
                return (
                    "simple_past_to_simple_present",
                    "The verb was changed from past tense to present tense.",
                    0.95,
                )

        # -----------------------------------------
        # Present participle changes
        # -----------------------------------------
        for forms in self.IRREGULAR_VERBS.values():
            if original in forms["present"] and corrected in forms["continuous"]:
                return (
                    "simple_present_to_present_continuous",
                    "The verb was changed to the present continuous form.",
                    0.90,
                )

            if original in forms["continuous"] and corrected in forms["present"]:
                return (
                    "present_continuous_to_simple_present",
                    "The verb was changed from present continuous to simple present.",
                    0.90,
                )

        # -----------------------------------------
        # Past → participle
        # -----------------------------------------
        for forms in self.IRREGULAR_VERBS.values():
            if original in forms["past"] and corrected in forms["participle"]:
                return (
                    "simple_past_to_present_perfect",
                    "The verb was changed to its past participle form.",
                    0.82,
                )

            if original in forms["participle"] and corrected in forms["past"]:
                return (
                    "present_perfect_to_simple_past",
                    "The verb was changed from a past participle form to simple past.",
                    0.82,
                )

        # -----------------------------------------
        # Negative tense changes
        # -----------------------------------------
        negative_pairs = {
            "don't": "didn't",
            "doesn't": "didn't",
            "isn't": "wasn't",
            "aren't": "weren't",
            "is": "was",
            "are": "were",
            "hasn't": "hadn't",
            "haven't": "hadn't",
            "has": "had",
            "have": "had",
        }

        if negative_pairs.get(original) == corrected:
            return (
                "negative_present_to_negative_past",
                "The negative verb was changed from present tense to past tense.",
                0.95,
            )

        # Reverse direction.
        for present, past in negative_pairs.items():
            if original == past and corrected == present:
                return (
                    "negative_past_to_negative_present",
                    "The negative verb was changed from past tense to present tense.",
                    0.95,
                )

        # -----------------------------------------
        # did/didn't + base verb
        # -----------------------------------------
        if index > 0:
            previous = self._normalise(original_tokens[index - 1])

            if previous in {"did", "didn't"}:
                if original != corrected:
                    return (
                        "did_base_form_correction",
                        "Use the base form of the verb after 'did' or 'didn't'.",
                        0.95,
                    )

        # -----------------------------------------
        # Modal + base verb
        # -----------------------------------------
        if index > 0:
            previous = self._normalise(original_tokens[index - 1])

            if previous in {
                "can",
                "could",
                "may",
                "might",
                "must",
                "shall",
                "should",
                "will",
                "would",
            }:
                return (
                    "modal_verb_correction",
                    "Use the base form of the verb after a modal verb.",
                    0.95,
                )

        return None

    def check(
        self,
        original: str,
        corrected: str,
        difference: dict,
    ) -> GrammarMatch | None:
        """Check a single difference against the surrounding sentence context."""

        original_tokens = original.split()
        corrected_tokens = corrected.split()

        original_word = difference.get("original", "")
        corrected_word = difference.get("corrected", "")

        if not original_word or not corrected_word:
            return None

        if not self._is_verb_pair(original_word, corrected_word):
            return None

        # Find the changed word in the original sentence.
        try:
            index = next(
                i
                for i, token in enumerate(original_tokens)
                if self._normalise(token) == self._normalise(original_word)
            )
        except StopIteration:
            return None

        result = self._detect_pattern(
            original_tokens,
            corrected_tokens,
            index,
        )


        
        if result is None:
                error_type= "Grammatical Changes"
                explanation= "changes could not be classified."
                confidence= .70
        else:
            error_type, explanation, confidence = result    


        return GrammarMatch(
            error_type=error_type,
            explanation=explanation,
            confidence=confidence,
        )


DEFAULT_RULES: tuple[GrammarRule, ...] = (
    SubjectVerbAgreementRule(),
    ArticleUsageRule(),
    VerbFormRule(),
    VerbTenseRule(),
)