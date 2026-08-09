import { useState, useCallback, useRef } from "react";

import Navbar from './components/Navbar';import HeroSection from "./components/HeroSection";
import TextInputCard from "./components/TextInputCard";
import LoadingState from "./components/LoadingState";
import ResultsDashboard from "./components/ResultsDashboard";
import ErrorBreakdown from "./components/ErrorBreakdown";
import HighlightedSentence from "./components/HighlightedSentence";
import SuggestionsPanel from "./components/SuggestionsPanel";
import CorrectedOutput from "./components/CorrectedOutput";
import NLPPipeline from "./components/NLPPipeline";
import Footer from "./components/Footer";

import { summarizeText, type AnalysisResult } from "./lib/grammarEngine";

import { API } from "./services/api";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [text, setText] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [analyzedText, setAnalyzedText] = useState("");

  // -----------------------------
  // PARAPHRASING STATE
  // -----------------------------

  const [paraphrasedText, setParaphrasedText] = useState("");

  const [paraphraseStyle, setParaphraseStyle] = useState<string>("neutral");

  const [isParaphrasing, setIsParaphrasing] = useState(false);

  // -----------------------------
  // SUMMARY STATE
  // -----------------------------

  const [summaryText, setSummaryText] = useState("");

  const [isSummarizing, setIsSummarizing] = useState(false);

  const inputRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------
  // SCROLL TO INPUT
  // -----------------------------

  const scrollToInput = () => {
    const el = document.getElementById("input-section");

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // =========================================================
  // ANALYZE
  // =========================================================

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setAnalyzedText(text);

    try {
      const response = await API.analyzeText(text);

      const errors = response.differences.map(
        (difference: any, index: number) => ({
          id: `${difference.error_type ?? difference.type}-${difference.original_start}-${index}`,

          type: "grammar",

          action: difference.type,

          original: difference.original,

          suggestion: difference.corrected,

          startIndex: difference.original_start,

          endIndex: difference.original_end,

          rule: difference.error_type ?? difference.rule ?? "Change",

          explanation:
            difference.explanation ??
            "This change improves the grammatical correctness of the sentence.",

          confidence:
            typeof difference.confidence === "number"
              ? Math.round(difference.confidence * 100)
              : 0,
        }),
      );

      const totalErrors = errors.length;

      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

      const score = Math.max(
        0,
        Math.min(
          100,
          Math.round(100 - totalErrors * (100 / Math.max(wordCount, 1)) * 3),
        ),
      );

      const readability =
        wordCount < 5
          ? "Too Short"
          : totalErrors === 0
            ? "Excellent"
            : totalErrors <= 2
              ? "Good"
              : totalErrors <= 4
                ? "Fair"
                : "Needs Improvement";

      const avgConfidence =
        errors.length > 0
          ? Math.round(
              errors.reduce((sum, error) => sum + error.confidence, 0) /
                errors.length,
            )
          : 100;

      const analysisResult: AnalysisResult = {
        score,
        errors,
        readability,
        confidence: avgConfidence,
        correctedText: response.corrected,

        errorBreakdown: {
          grammar: totalErrors,
          spelling: 0,
          punctuation: 0,
          syntax: 0,
        },
      };

      setResult(analysisResult);
    } catch (error) {
      console.error("Analyze API error:", error);

      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [text]);

  // =========================================================
  // PARAPHRASE
  // =========================================================

  const handleParaphrase = useCallback(
    async (style: string) => {
      if (!text.trim()) return;

      // Keep App's state synchronized with the selected style
      setParaphraseStyle(style);

      setIsParaphrasing(true);

      try {
        console.log("Paraphrasing with style:", style);

        const response = await API.paraphraseText(text, style, 1, 128);

        console.log("Paraphrase response:", response);

        if (Array.isArray(response)) {
          setParaphrasedText(response.join(" "));
        } else if (typeof response === "string") {
          setParaphrasedText(response);
        } else if (response?.paraphrasedText) {
          setParaphrasedText(response.paraphrasedText);
        } else if (response?.text) {
          setParaphrasedText(response.text);
        } else {
          console.error("Unexpected paraphrase response:", response);

          setParaphrasedText("");
        }
      } catch (error) {
        console.error("Paraphrase API error:", error);

        setParaphrasedText("");
      } finally {
        setIsParaphrasing(false);
      }
    },
    [text],
  );

  // =========================================================
  // SUMMARY
  // =========================================================

  const handleSummary = useCallback(() => {
    if (!text.trim()) return;

    setIsSummarizing(true);

    setTimeout(() => {
      setSummaryText(summarizeText(text));

      setIsSummarizing(false);
    }, 400);
  }, [text]);

  // =========================================================
  // APPLY GRAMMAR FIX
  // =========================================================

  const handleApplyFix = useCallback(
    async (errorId: string) => {
      if (!result) return;

      const error = result.errors.find((e) => e.id === errorId);

      if (!error) return;

      const newText =
        text.slice(0, error.startIndex) +
        error.suggestion +
        text.slice(error.endIndex);

      setText(newText);

      try {
        setIsAnalyzing(true);

        const response = await API.analyzeText(newText);

        const errors = response.differences.map(
          (difference: any, index: number) => ({
            id: `${difference.error_type ?? difference.type}-${difference.original_start}-${index}`,

            type: "grammar",

            action: difference.type,

            original: difference.original,

            suggestion: difference.corrected,

            startIndex: difference.original_start,

            endIndex: difference.original_end,

            rule: difference.error_type ?? difference.rule ?? "Change",

            explanation:
              difference.explanation ??
              "This change improves the grammatical correctness of the sentence.",

            confidence:
              typeof difference.confidence === "number"
                ? Math.round(difference.confidence * 100)
                : 0,
          }),
        );

        const totalErrors = errors.length;

        const wordCount = newText.trim().split(/\s+/).filter(Boolean).length;

        const score = Math.max(
          0,
          Math.min(
            100,
            Math.round(100 - totalErrors * (100 / Math.max(wordCount, 1)) * 3),
          ),
        );

        const readability =
          wordCount < 5
            ? "Too Short"
            : totalErrors === 0
              ? "Excellent"
              : totalErrors <= 2
                ? "Good"
                : totalErrors <= 4
                  ? "Fair"
                  : "Needs Improvement";

        const avgConfidence =
          errors.length > 0
            ? Math.round(
                errors.reduce((sum, error) => sum + error.confidence, 0) /
                  errors.length,
              )
            : 100;

        const analysisResult: AnalysisResult = {
          score,
          errors,
          readability,
          confidence: avgConfidence,

          correctedText: response.corrected,

          errorBreakdown: {
            grammar: totalErrors,
            spelling: 0,
            punctuation: 0,
            syntax: 0,
          },
        };

        setResult(analysisResult);

        setAnalyzedText(newText);
      } catch (error) {
        console.error("Apply fix error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [result, text],
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#0F172A]" : "bg-[#F8FAFC]"
      }`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} onTryNow={scrollToInput} />

      <HeroSection darkMode={darkMode} onTryNow={scrollToInput} />

      <div ref={inputRef} id="input-section">
        <TextInputCard
          darkMode={darkMode}
          text={text}
          setText={setText}
          onAnalyze={handleAnalyze}
          onParaphrase={handleParaphrase}
          onSummary={handleSummary}
          paraphrasedText={paraphrasedText}
          summaryText={summaryText}
          paraphraseStyle={paraphraseStyle}
          setParaphraseStyle={setParaphraseStyle}
          isAnalyzing={isAnalyzing}
          isParaphrasing={isParaphrasing}
          isSummarizing={isSummarizing}
        />
      </div>

      {isAnalyzing && <LoadingState darkMode={darkMode} />}

      {result && !isAnalyzing && (
        <>
          <ResultsDashboard darkMode={darkMode} result={result} />

          <ErrorBreakdown darkMode={darkMode} result={result} />

          <HighlightedSentence
            darkMode={darkMode}
            text={analyzedText}
            errors={result.errors}
            onApply={handleApplyFix}
          />

          <SuggestionsPanel
            darkMode={darkMode}
            errors={result.errors}
            onApply={handleApplyFix}
          />

          <CorrectedOutput
            darkMode={darkMode}
            originalText={analyzedText}
            correctedText={result.correctedText}
          />
        </>
      )}

      <NLPPipeline darkMode={darkMode} />

      <Footer darkMode={darkMode} />
    </div>
  );
}
