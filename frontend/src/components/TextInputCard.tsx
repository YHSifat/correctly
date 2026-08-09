import { useState } from "react";
import { motion } from "framer-motion";

import {
  Sparkles,
  RotateCcw,
  FileText,
  RefreshCw,
  ListChecks,
  ChevronDown,
} from "lucide-react";

import { countWords, countCharacters } from "../lib/grammarEngine";

interface TextInputCardProps {
  darkMode: boolean;

  text: string;
  setText: (v: string) => void;

  onAnalyze: () => void;

  // IMPORTANT:
  // We pass the selected style to App.tsx
  onParaphrase: (style: string) => void;

  onSummary: () => void;

  paraphrasedText: string;
  summaryText: string;

  paraphraseStyle: string;
  setParaphraseStyle: (style: string) => void;

  isAnalyzing: boolean;
  isParaphrasing: boolean;
  isSummarizing: boolean;
}

const exampleSentences = [
  "She go to school yesterday and dont study for teh exam.",
  "Me and him was going to the store but their was nothing their.",
  "He have alot of work to do and she dont know about it.",
  "The childs was playing in teh park and they was very happy.",
  "I could of went to the party but your not invited irregardless.",
];

const paraphraseStyles = [
  "neutral",
  "formal",
  "casual",
  "confident",
  "simple",
  "concise",
];

export default function TextInputCard({
  darkMode,

  text,
  setText,

  onAnalyze,
  onParaphrase,
  onSummary,

  paraphrasedText,
  summaryText,

  paraphraseStyle,
  setParaphraseStyle,

  isAnalyzing,
  isParaphrasing,
  isSummarizing,
}: TextInputCardProps) {
  const words = countWords(text);
  const chars = countCharacters(text);
  const [prevParaphraseStyle, setPrevParaphraseStyle] =
    useState(paraphraseStyle);

  const [showParaphraseStyles, setShowParaphraseStyles] = useState(false);

  const loadExample = () => {
    const random =
      exampleSentences[Math.floor(Math.random() * exampleSentences.length)];

    setText(random);
  };

  const handleParaphraseClick = () => {
    if (!text.trim() || isParaphrasing) {
      return;
    }

    // Send currently selected style to App.tsx
    onParaphrase(paraphraseStyle);
    setPrevParaphraseStyle(paraphraseStyle);
    // Close dropdown
    setShowParaphraseStyles(false);
  };

  return (
    <section id="input-section" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        {" "}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className={`rounded-[24px] p-8 md:p-10 shadow-xl border transition-colors ${
            darkMode
              ? "bg-[#1E293B] border-[#334155] shadow-black/30"
              : "bg-white border-[#E2E8F0] shadow-[#2563EB]/5"
          }`}
        >
          {/* ========================================= */}
          {/* HEADER */}
          {/* ========================================= */}

          <div className="flex items-center justify-between mb-5">
            <h2
              className={`text-lg font-semibold ${
                darkMode ? "text-white" : "text-[#0F172A]"
              }`}
            >
              Paste your text
            </h2>

            <button
              onClick={loadExample}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                darkMode
                  ? "text-[#94A3B8] hover:bg-[#334155]"
                  : "text-[#64748B] hover:bg-[#F1F5F9]"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Try Example
            </button>
          </div>

          {/* ========================================= */}
          {/* TEXTAREA */}
          {/* ========================================= */}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your sentence here..."
            rows={6}
            className={`w-full rounded-2xl p-6 text-base leading-relaxed resize-none outline-none transition-all border-2 focus:ring-4 ${
              darkMode
                ? "bg-[#0F172A] border-[#334155] text-white placeholder:text-[#475569] focus:border-[#2563EB] focus:ring-[#2563EB]/10"
                : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-[#2563EB]/10"
            }`}
          />

          {/* ========================================= */}
          {/* COUNTERS + BUTTONS */}
          {/* ========================================= */}

          <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
            {/* COUNTERS */}

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    darkMode ? "text-[#64748B]" : "text-[#94A3B8]"
                  }`}
                >
                  Words
                </span>

                <span
                  className={`text-sm font-bold ${
                    darkMode ? "text-white" : "text-[#0F172A]"
                  }`}
                >
                  {words}
                </span>
              </div>

              <div
                className={`w-px h-4 ${darkMode ? "bg-[#334155]" : "bg-[#E2E8F0]"}`}
              />

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    darkMode ? "text-[#64748B]" : "text-[#94A3B8]"
                  }`}
                >
                  Characters
                </span>

                <span
                  className={`text-sm font-bold ${
                    darkMode ? "text-white" : "text-[#0F172A]"
                  }`}
                >
                  {chars}
                </span>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="flex flex-wrap items-center gap-3">
              {/* ANALYZE */}

              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={onAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-[15px] transition-all ${
                  !text.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-[#2563EB]/25 hover:shadow-xl"
                }`}
              >
                <Sparkles className="w-4.5 h-4.5" />

                {isAnalyzing ? "Analyzing..." : "Analyze Text"}
              </motion.button>

              {/* ===================================== */}
              {/* PARAPHRASE DROPDOWN */}
              {/* ===================================== */}

              <div className="relative">
                <div className="flex">
                  {/* MAIN PARAPHRASE BUTTON */}

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={handleParaphraseClick}
                    disabled={!text.trim() || isParaphrasing}
                    className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-l-2xl font-semibold text-[15px] transition-all ${
                      !text.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-[#10B981]/20 hover:shadow-xl"
                    }`}
                  >
                    <RefreshCw className="w-4.5 h-4.5" />

                    {isParaphrasing ? "Rephrasing..." : "Paraphrase"}
                  </motion.button>

                  {/* DROPDOWN BUTTON */}

                  <button
                    type="button"
                    disabled={!text.trim() || isParaphrasing}
                    onClick={() => setShowParaphraseStyles((prev) => !prev)}
                    className={`px-3 py-3 rounded-r-2xl border-l border-white/20 transition-all ${
                      !text.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:brightness-95"
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showParaphraseStyles ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* ================================= */}
                {/* STYLE MENU */}
                {/* ================================= */}

                {showParaphraseStyles && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-xl overflow-hidden z-50 ${
                      darkMode
                        ? "bg-[#1E293B] border-[#334155]"
                        : "bg-white border-[#E2E8F0]"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                        darkMode ? "text-[#64748B]" : "text-[#94A3B8]"
                      }`}
                    >
                      Paraphrase Style
                    </div>

                    {paraphraseStyles.map((style) => {
                      const selected = paraphraseStyle === style;

                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => {
                            setParaphraseStyle(style);

                            setShowParaphraseStyles(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                            selected
                              ? darkMode
                                ? "bg-[#059669]/20 text-[#34D399]"
                                : "bg-[#ECFDF5] text-[#059669]"
                              : darkMode
                                ? "text-slate-200 hover:bg-[#334155]"
                                : "text-slate-700 hover:bg-[#F1F5F9]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{style}</span>

                            {selected && <span className="text-xs">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* OUTPUT */}
          {/* ========================================= */}

          {(paraphrasedText || summaryText) && !isParaphrasing && (
            <div
              className={`mt-6 grid gap-4 rounded-2xl p-5 border ${
                darkMode
                  ? "bg-[#0F172A] border-[#334155]"
                  : "bg-[#F8FAFC] border-[#E2E8F0]"
              }`}
            >
              {/* PARAPHRASE */}

              {paraphrasedText && !isParaphrasing && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                        darkMode ? "text-[#94A3B8]" : "text-[#64748B]"
                      }`}
                    >
                      Paraphrase
                    </p>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        darkMode
                          ? "bg-[#334155] text-[#94A3B8]"
                          : "bg-[#E2E8F0] text-[#64748B]"
                      }`}
                    >
                      {prevParaphraseStyle}
                    </span>
                  </div>

                  <p
                    className={`text-sm leading-7 ${
                      darkMode ? "text-slate-100" : "text-slate-700"
                    }`}
                  >
                    {paraphrasedText}
                  </p>
                </div>
              )}

              {/* SUMMARY */}

              {summaryText && (
                <div>
                  <p
                    className={`mb-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                      darkMode ? "text-[#94A3B8]" : "text-[#64748B]"
                    }`}
                  >
                    Summary
                  </p>

                  <p
                    className={`text-sm leading-7 ${
                      darkMode ? "text-slate-100" : "text-slate-700"
                    }`}
                  >
                    {summaryText}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
