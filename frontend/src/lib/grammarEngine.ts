export interface GrammarError {
  id: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'syntax';
  original: string;
  suggestion: string;
  explanation: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  rule: string;
}

export interface AnalysisResult {
  score: number;
  errors: GrammarError[];
  readability: string;
  confidence: number;
  correctedText: string;
  errorBreakdown: {
    grammar: number;
    spelling: number;
    punctuation: number;
    syntax: number;
  };
}

interface GrammarRule {
  pattern: RegExp;
  type: GrammarError['type'];
  rule: string;
  explanation: string;
  confidence: number;
  getSuggestion: (match: RegExpMatchArray) => string;
}

const grammarRules: GrammarRule[] = [
  // Subject-verb agreement: "She/He/It go" → "goes"
  {
    pattern: /\b(she|he|it)\s+(go)\b/gi,
    type: 'grammar',
    rule: 'Subject-Verb Agreement',
    explanation: 'Third-person singular subjects (she, he, it) require the verb form "goes" instead of "go".',
    confidence: 98,
    getSuggestion: (match) => match[0].replace(/\bgo\b/i, 'goes'),
  },
  // "She/He/It have" → "has"
  {
    pattern: /\b(she|he|it)\s+(have)\b/gi,
    type: 'grammar',
    rule: 'Subject-Verb Agreement',
    explanation: 'Third-person singular subjects require "has" instead of "have".',
    confidence: 97,
    getSuggestion: (match) => match[0].replace(/\bhave\b/i, 'has'),
  },
  // "She/He/It don't" → "doesn't"
  {
    pattern: /\b(she|he|it)\s+(don'?t)\b/gi,
    type: 'grammar',
    rule: 'Subject-Verb Agreement',
    explanation: 'Third-person singular subjects require "doesn\'t" instead of "don\'t".',
    confidence: 96,
    getSuggestion: (match) => match[0].replace(/\bdon'?t\b/i, "doesn't"),
  },
  // "I is" → "I am"
  {
    pattern: /\b(I)\s+(is)\b/g,
    type: 'grammar',
    rule: 'Subject-Verb Agreement',
    explanation: 'The pronoun "I" requires the verb "am" instead of "is".',
    confidence: 99,
    getSuggestion: (match) => match[0].replace(/\bis\b/, 'am'),
  },
  // "They/We is" → "are"
  {
    pattern: /\b(they|we)\s+(is)\b/gi,
    type: 'grammar',
    rule: 'Subject-Verb Agreement',
    explanation: 'Plural subjects require "are" instead of "is".',
    confidence: 98,
    getSuggestion: (match) => match[0].replace(/\bis\b/i, 'are'),
  },
  // "She/He run" → "runs"
  {
    pattern: /\b(she|he|it)\s+(run|walk|talk|eat|drink|think|know|like|want|need|make|take|come|see|look|find|give|tell|work|call|try|ask|use|play|move|live|believe|happen|include|turn|follow|meet|lead|learn|change|help|show|hear|read|write|sing|speak|swim|drive|fly|buy|sell|teach|catch|throw|sit|stand|break|wear|choose|begin|grow|draw|pay|cut|build|send|fall|feel|keep|let|mean|set|bring|start|hold)\b/gi,
    type: 'grammar',
    rule: 'Subject-Verb Agreement',
    explanation: 'Third-person singular subjects require an "-s" or "-es" ending on the verb.',
    confidence: 95,
    getSuggestion: (match) => {
      const verb = match[2].toLowerCase();
      let conjugated = verb + 's';
      if (verb.endsWith('ch') || verb.endsWith('sh') || verb.endsWith('x') || verb.endsWith('s')) {
        conjugated = verb + 'es';
      } else if (verb.endsWith('y') && !/[aeiou]y$/i.test(verb)) {
        conjugated = verb.slice(0, -1) + 'ies';
      }
      return match[0].replace(new RegExp(`\\b${match[2]}\\b`, 'i'), conjugated);
    },
  },
  // Double negatives
  {
    pattern: /\b(don'?t|doesn'?t|didn'?t|won'?t|can'?t|couldn'?t|wouldn'?t|shouldn'?t)\s+\w+\s+(no|nothing|nobody|nowhere|neither|never)\b/gi,
    type: 'grammar',
    rule: 'Double Negative',
    explanation: 'Double negatives create a positive meaning. Use only one negative form.',
    confidence: 90,
    getSuggestion: (match) => match[0].replace(/\bno\b/gi, 'any').replace(/\bnothing\b/gi, 'anything').replace(/\bnobody\b/gi, 'anybody').replace(/\bnowhere\b/gi, 'anywhere'),
  },
  // Common misspellings
  {
    pattern: /\b(teh|hte)\b/gi,
    type: 'spelling',
    rule: 'Common Misspelling',
    explanation: 'This appears to be a misspelling of "the".',
    confidence: 99,
    getSuggestion: () => 'the',
  },
  {
    pattern: /\b(recieve)\b/gi,
    type: 'spelling',
    rule: 'Common Misspelling',
    explanation: '"Recieve" is a common misspelling. The correct spelling is "receive" (i before e except after c).',
    confidence: 99,
    getSuggestion: () => 'receive',
  },
  {
    pattern: /\b(definately|definatly|defintely)\b/gi,
    type: 'spelling',
    rule: 'Common Misspelling',
    explanation: 'The correct spelling is "definitely".',
    confidence: 99,
    getSuggestion: () => 'definitely',
  },
  {
    pattern: /\b(occured)\b/gi,
    type: 'spelling',
    rule: 'Common Misspelling',
    explanation: 'The correct spelling is "occurred" with double "r".',
    confidence: 99,
    getSuggestion: () => 'occurred',
  },
  {
    pattern: /\b(seperate)\b/gi,
    type: 'spelling',
    rule: 'Common Misspelling',
    explanation: 'The correct spelling is "separate" with an "a" in the middle.',
    confidence: 99,
    getSuggestion: () => 'separate',
  },
  {
    pattern: /\b(accomodate)\b/gi,
    type: 'spelling',
    rule: 'Common Misspelling',
    explanation: 'The correct spelling is "accommodate" with double "c" and double "m".',
    confidence: 99,
    getSuggestion: () => 'accommodate',
  },
  {
    pattern: /\b(neccessary|necessery)\b/gi,
    type: 'spelling',
    rule: 'Common Misspelling',
    explanation: 'The correct spelling is "necessary".',
    confidence: 99,
    getSuggestion: () => 'necessary',
  },
  {
    pattern: /\b(wierd)\b/gi,
    type: 'spelling',
    rule: 'Common Misspelling',
    explanation: 'The correct spelling is "weird" (e before i in this case).',
    confidence: 99,
    getSuggestion: () => 'weird',
  },
  {
    pattern: /\b(untill)\b/gi,
    type: 'spelling',
    rule: 'Common Misspelling',
    explanation: 'The correct spelling is "until" with one "l".',
    confidence: 99,
    getSuggestion: () => 'until',
  },
  {
    pattern: /\b(alot)\b/gi,
    type: 'spelling',
    rule: 'Spacing Error',
    explanation: '"Alot" is not a word. It should be written as two words: "a lot".',
    confidence: 99,
    getSuggestion: () => 'a lot',
  },
  {
    pattern: /\b(irregardless)\b/gi,
    type: 'grammar',
    rule: 'Non-standard Word',
    explanation: '"Irregardless" is non-standard. Use "regardless" instead.',
    confidence: 95,
    getSuggestion: () => 'regardless',
  },
  // "Their/There/They're" confusion
  {
    pattern: /\b(their)\s+(is|are|was|were)\b/gi,
    type: 'grammar',
    rule: 'Homophone Confusion',
    explanation: '"Their" is possessive. Use "there" when indicating existence.',
    confidence: 88,
    getSuggestion: (match) => match[0].replace(/\btheir\b/i, 'there'),
  },
  // "Your/You're" confusion
  {
    pattern: /\b(your)\s+(a|an|the|going|being|not|very|so|really|always|never)\b/gi,
    type: 'grammar',
    rule: 'Homophone Confusion',
    explanation: '"Your" is possessive. You likely mean "you\'re" (you are).',
    confidence: 85,
    getSuggestion: (match) => match[0].replace(/\byour\b/i, "you're"),
  },
  // "Its/It's" confusion
  {
    pattern: /\b(its)\s+(a|an|the|going|being|not|very|so|really)\b/gi,
    type: 'grammar',
    rule: 'Homophone Confusion',
    explanation: '"Its" is possessive. You likely mean "it\'s" (it is).',
    confidence: 85,
    getSuggestion: (match) => match[0].replace(/\bits\b/i, "it's"),
  },
  // Missing comma before conjunction in compound sentence
  {
    pattern: /[a-z]\s+(and|but|or|yet|so)\s+[A-Z]/g,
    type: 'punctuation',
    rule: 'Missing Comma',
    explanation: 'A comma is typically needed before a coordinating conjunction that joins two independent clauses.',
    confidence: 75,
    getSuggestion: (match) => match[0].replace(/\s+(and|but|or|yet|so)\s+/, `, ${match[1]} `),
  },
  // "could of" → "could have"
  {
    pattern: /\b(could|would|should|must|might)\s+of\b/gi,
    type: 'grammar',
    rule: 'Incorrect Auxiliary',
    explanation: '"Of" is not a verb. Use "have" after modal verbs.',
    confidence: 97,
    getSuggestion: (match) => match[0].replace(/\bof\b/i, 'have'),
  },
  // "Me and her" at start of sentence
  {
    pattern: /^(me)\s+(and)\b/gim,
    type: 'grammar',
    rule: 'Pronoun Case',
    explanation: 'When used as a subject, use "I" instead of "me".',
    confidence: 90,
    getSuggestion: (match) => match[0].replace(/^me/i, 'I'),
  },
  // Run-on sentence detection (very long without punctuation)
  {
    pattern: /^[A-Z][^.!?]{150,}$/gm,
    type: 'syntax',
    rule: 'Run-on Sentence',
    explanation: 'This sentence is very long and may be a run-on. Consider breaking it into shorter sentences.',
    confidence: 70,
    getSuggestion: (match) => match[0],
  },
  // "a" before vowel sound
  {
    pattern: /\ba\s+(apple|orange|egg|elephant|umbrella|hour|honest|honor|heir|uncle|ant|eagle|igloo|owl|ice|ocean|idea|ear|eye|arm|ape|acre|inch|ounce|eel|oak|olive|onion)\b/gi,
    type: 'grammar',
    rule: 'Article Usage',
    explanation: 'Use "an" before words that begin with a vowel sound.',
    confidence: 95,
    getSuggestion: (match) => match[0].replace(/\ba\b/i, 'an'),
  },
  // Fragment: sentence starting with "Because" without main clause
  {
    pattern: /^Because\s+[^,.]+[^.!?]$/gm,
    type: 'syntax',
    rule: 'Sentence Fragment',
    explanation: 'A clause starting with "Because" needs a main clause to form a complete sentence.',
    confidence: 80,
    getSuggestion: (match) => match[0] + '.',
  },
  // "yesterday" with present tense
  {
    pattern: /\b(goes|go|come|comes|run|runs|walk|walks|eat|eats|play|plays)\b[^.]*\byesterday\b/gi,
    type: 'grammar',
    rule: 'Tense Consistency',
    explanation: '"Yesterday" indicates past tense. The verb should be in past tense form.',
    confidence: 92,
    getSuggestion: (match) => {
      const tenseMap: Record<string, string> = {
        'go': 'went', 'goes': 'went', 'come': 'came', 'comes': 'came',
        'run': 'ran', 'runs': 'ran', 'walk': 'walked', 'walks': 'walked',
        'eat': 'ate', 'eats': 'ate', 'play': 'played', 'plays': 'played',
      };
      let result = match[0];
      for (const [present, past] of Object.entries(tenseMap)) {
        const regex = new RegExp(`\\b${present}\\b`, 'i');
        if (regex.test(result)) {
          result = result.replace(regex, past);
          break;
        }
      }
      return result;
    },
  },
];

let idCounter = 0;

export function analyzeText(text: string): AnalysisResult {
  const errors: GrammarError[] = [];
  const processedRanges: Array<{ start: number; end: number }> = [];

  for (const rule of grammarRules) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;

      // Avoid overlapping errors
      const overlaps = processedRanges.some(
        (range) => startIndex < range.end && endIndex > range.start
      );

      if (!overlaps) {
        const suggestion = rule.getSuggestion(match);
        if (suggestion !== match[0]) {
          errors.push({
            id: `err-${++idCounter}`,
            type: rule.type,
            original: match[0],
            suggestion,
            explanation: rule.explanation,
            confidence: rule.confidence,
            startIndex,
            endIndex,
            rule: rule.rule,
          });
          processedRanges.push({ start: startIndex, end: endIndex });
        }
      }
    }
  }

  // Sort errors by position
  errors.sort((a, b) => a.startIndex - b.startIndex);

  // Generate corrected text
  let correctedText = text;
  // Apply corrections in reverse order to maintain indices
  const sortedErrors = [...errors].sort((a, b) => b.startIndex - a.startIndex);
  for (const error of sortedErrors) {
    correctedText =
      correctedText.slice(0, error.startIndex) +
      error.suggestion +
      correctedText.slice(error.endIndex);
  }

  const errorBreakdown = {
    grammar: errors.filter((e) => e.type === 'grammar').length,
    spelling: errors.filter((e) => e.type === 'spelling').length,
    punctuation: errors.filter((e) => e.type === 'punctuation').length,
    syntax: errors.filter((e) => e.type === 'syntax').length,
  };

  const totalErrors = errors.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.max(0, Math.min(100, Math.round(100 - totalErrors * (100 / Math.max(wordCount, 1)) * 3)));

  const readability =
    wordCount < 5
      ? 'Too Short'
      : totalErrors === 0
        ? 'Excellent'
        : totalErrors <= 2
          ? 'Good'
          : totalErrors <= 4
            ? 'Fair'
            : 'Needs Improvement';

  const avgConfidence =
    errors.length > 0
      ? Math.round(errors.reduce((sum, e) => sum + e.confidence, 0) / errors.length)
      : 100;

  return {
    score,
    errors,
    readability,
    confidence: avgConfidence,
    correctedText,
    errorBreakdown,
  };
}

export function paraphraseText(text: string): string {
  const cleanText = text.trim();
  if (!cleanText) return '';

  return cleanText
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .map((sentence) => {
      let paraphrased = sentence.trim();

      paraphrased = paraphrased
        .replace(/\bI am\b/gi, "I'm")
        .replace(/\bI have\b/gi, "I've")
        .replace(/\bIt is\b/gi, "It's")
        .replace(/\bWe are\b/gi, "We're")
        .replace(/\bDo not\b/gi, "Don't")
        .replace(/\bCannot\b/gi, "Can't")
        .replace(/\bvery\b/gi, "highly")
        .replace(/\bgood\b/gi, "excellent")
        .replace(/\buse\b/gi, "utilize")
        .replace(/\bshow\b/gi, "demonstrate")
        .replace(/\bhelp\b/gi, "assist")
        .replace(/\bneed\b/gi, "require")
        .replace(/\bstart\b/gi, "begin");

      if (!/[.!?]$/.test(paraphrased)) {
        paraphrased += '.';
      }

      return `In other words, ${paraphrased}`;
    })
    .join(' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}

export function summarizeText(text: string): string {
  const cleanText = text.trim();
  if (!cleanText) return '';

  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) return 'No content available for a summary.';

  const summarySentences = sentences.slice(0, Math.min(2, sentences.length));
  const summary = summarySentences.join(' ');

  return summary.length > 220 ? `${summary.slice(0, 220).trim()}...` : summary;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countCharacters(text: string): number {
  return text.length;
}
