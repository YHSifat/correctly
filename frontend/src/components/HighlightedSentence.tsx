import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Eye, AlertCircle, Check } from "lucide-react";
import type { GrammarError } from "../lib/grammarEngine";

interface HighlightedSentenceProps {
  darkMode: boolean;
  text: string;
  errors: GrammarError[];
  onApply: (errorId: string) => void;
}

const errorColors: Record<
  string,
  { bg: string; border: string; text: string; underline: string }
> = {
  grammar: {
    bg: "bg-[#EF4444]/10",
    border: "border-[#EF4444]/30",
    text: "text-[#EF4444]",
    underline: "error-underline",
  },
  spelling: {
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/30",
    text: "text-[#F59E0B]",
    underline: "spelling-underline",
  },
  punctuation: {
    bg: "bg-[#2563EB]/10",
    border: "border-[#2563EB]/30",
    text: "text-[#2563EB]",
    underline: "error-underline",
  },
  syntax: {
    bg: "bg-[#7C3AED]/10",
    border: "border-[#7C3AED]/30",
    text: "text-[#7C3AED]",
    underline: "syntax-underline",
  },
  // Difference-based colors: changed/update (blue), removed (red), added (green)
  changed: {
    bg: "bg-[#2563EB]/10",
    border: "border-[#2563EB]/30",
    text: "text-[#2563EB]",
    underline: "error-underline",
  },
  removed: {
    bg: "bg-[#EF4444]/10",
    border: "border-[#EF4444]/30",
    text: "text-[#EF4444]",
    underline: "error-underline",
  },
  added: {
    bg: "bg-[#22C55E]/10",
    border: "border-[#22C55E]/30",
    text: "text-[#22C55E]",
    underline: "error-underline",
  },
};

export default function HighlightedSentence({
  darkMode,
  text,
  errors,
  onApply,
}: HighlightedSentenceProps) {
  const [hoveredError, setHoveredError] = useState<string | null>(null);

  // Build segments
  const segments: Array<{ text: string; error?: GrammarError }> = [];
  let lastIndex = 0;
  const sortedErrors = [...errors].sort((a, b) => a.startIndex - b.startIndex);

  for (const error of sortedErrors) {
    if (error.startIndex > lastIndex) {
      segments.push({ text: text.slice(lastIndex, error.startIndex) });
    }
    segments.push({
      text: text.slice(error.startIndex, error.endIndex),
      error,
    });
    lastIndex = error.endIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  if (errors.length === 0) return null;

  return (
    <section className="py-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#EF4444]/10 flex items-center justify-center">
              <Eye className="w-4.5 h-4.5 text-[#EF4444]" />
            </div>
            <h3
              className={`text-xl font-bold ${darkMode ? "text-white" : "text-[#0F172A]"}`}
            >
              Highlighted Text
            </h3>
          </div>

          <div
            className={`rounded-[20px] p-8 border transition-colors ${
              darkMode
                ? "bg-[#1E293B] border-[#334155]"
                : "bg-white border-[#E2E8F0]"
            }`}
          >
            <p
              className={`text-lg leading-relaxed ${darkMode ? "text-[#E2E8F0]" : "text-[#334155]"}`}
            >
              {segments.map((seg, i) => {
                if (!seg.error) {
                  return <span key={i}>{seg.text}</span>;
                }

                const actionKey = (seg.error as any).action ?? seg.error.type;
                const colors = errorColors[actionKey] || errorColors.grammar;
                const isHovered = hoveredError === seg.error.id;

                return (
                  <span
                    key={i}
                    className={`relative inline-block cursor-pointer ${colors.underline} transition-all ${
                      isHovered ? `${colors.bg} rounded px-0.5` : ""
                    }`}
                    onMouseEnter={() => setHoveredError(seg.error!.id)}
                    onMouseLeave={() => setHoveredError(null)}
                  >
                    {seg.text}

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className={`absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl p-5 border shadow-xl ${
                            darkMode
                              ? "bg-[#0F172A] border-[#334155]"
                              : "bg-white border-[#E2E8F0]"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className={`w-4 h-4 ${colors.text}`} />
                            <span
                              className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}
                            >
                              {String(seg.error!.type).charAt(0).toUpperCase() +
                                String(seg.error!.type).slice(1)}{" "}
                              Issue
                            </span>
                          </div>
                          <p
                            className={`text-sm font-medium mb-1 ${darkMode ? "text-[#94A3B8]" : "text-[#64748B]"}`}
                          >
                            {seg.error!.rule}
                          </p>
                          <div className="flex items-center gap-2 mt-3 mb-3">
                            <span
                              className={`text-sm line-through ${darkMode ? "text-[#64748B]" : "text-[#94A3B8]"}`}
                            >
                              {seg.error!.original}
                            </span>
                            <span
                              className={`text-sm ${darkMode ? "text-[#64748B]" : "text-[#94A3B8]"}`}
                            >
                              →
                            </span>
                            <span className="text-sm font-semibold text-[#22C55E]">
                              {seg.error!.suggestion}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApply(seg.error!.id);
                              setHoveredError(null);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22C55E] text-white text-sm font-semibold hover:bg-[#16A34A] transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Apply Fix
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </span>
                );
              })}
            </p>

            {/* Legend */}
            <div
              className={`flex items-center gap-5 mt-6 pt-5 border-t flex-wrap ${
                darkMode ? "border-[#334155]" : "border-[#F1F5F9]"
              }`}
            >
              {Object.entries(errorColors).map(([type, colors]) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`}
                  />
                  <span
                    className={`text-xs font-medium capitalize ${darkMode ? "text-[#64748B]" : "text-[#94A3B8]"}`}
                  >
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
