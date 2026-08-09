import { useState, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TextInputCard from './components/TextInputCard';
import LoadingState from './components/LoadingState';
import ResultsDashboard from './components/ResultsDashboard';
import ErrorBreakdown from './components/ErrorBreakdown';
import HighlightedSentence from './components/HighlightedSentence';
import SuggestionsPanel from './components/SuggestionsPanel';
import CorrectedOutput from './components/CorrectedOutput';
import NLPPipeline from './components/NLPPipeline';
import Footer from './components/Footer';
import {
  analyzeText,
  paraphraseText,
  summarizeText,
  type AnalysisResult,
} from './lib/grammarEngine';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedText, setAnalyzedText] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const scrollToInput = () => {
    const el = document.getElementById('input-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAnalyze = useCallback(() => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setAnalyzedText(text);

    // Simulate processing time for the loading animation
    setTimeout(() => {
      const analysisResult = analyzeText(text);
      setResult(analysisResult);
      setIsAnalyzing(false);
    }, 3200);
  }, [text]);

  const handleParaphrase = useCallback(() => {
    if (!text.trim()) return;

    setIsParaphrasing(true);

    setTimeout(() => {
      setParaphrasedText(paraphraseText(text));
      setIsParaphrasing(false);
    }, 400);
  }, [text]);

  const handleSummary = useCallback(() => {
    if (!text.trim()) return;

    setIsSummarizing(true);

    setTimeout(() => {
      setSummaryText(summarizeText(text));
      setIsSummarizing(false);
    }, 400);
  }, [text]);

  const handleApplyFix = useCallback(
    (errorId: string) => {
      if (!result) return;

      const error = result.errors.find((e) => e.id === errorId);
      if (!error) return;

      // Apply the fix to the current text
      const newText =
        text.slice(0, error.startIndex) + error.suggestion + text.slice(error.endIndex);
      setText(newText);

      // Re-analyze with the fixed text
      const newResult = analyzeText(newText);
      setResult(newResult);
      setAnalyzedText(newText);
    },
    [result, text]
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'
      }`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} onTryNow={scrollToInput} />

      <HeroSection darkMode={darkMode} onTryNow={scrollToInput} />

      <div ref={inputRef}>
        <TextInputCard
          darkMode={darkMode}
          text={text}
          setText={setText}
          onAnalyze={handleAnalyze}
          onParaphrase={handleParaphrase}
          onSummary={handleSummary}
          paraphrasedText={paraphrasedText}
          summaryText={summaryText}
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
