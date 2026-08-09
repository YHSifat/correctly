import { motion } from 'framer-motion';
import { Lightbulb, Check, ArrowRight, Gauge } from 'lucide-react';
import type { GrammarError } from '../lib/grammarEngine';

interface SuggestionsPanelProps {
  darkMode: boolean;
  errors: GrammarError[];
  onApply: (errorId: string) => void;
}

const typeColors: Record<string, { accent: string; bg: string; label: string }> = {
  grammar: { accent: '#EF4444', bg: 'bg-[#EF4444]/10', label: 'Grammar' },
  spelling: { accent: '#F59E0B', bg: 'bg-[#F59E0B]/10', label: 'Spelling' },
  punctuation: { accent: '#2563EB', bg: 'bg-[#2563EB]/10', label: 'Punctuation' },
  syntax: { accent: '#7C3AED', bg: 'bg-[#7C3AED]/10', label: 'Syntax' },
};

export default function SuggestionsPanel({ darkMode, errors, onApply }: SuggestionsPanelProps) {
  if (errors.length === 0) return null;

  return (
    <section className="py-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
              <Lightbulb className="w-4.5 h-4.5 text-[#F59E0B]" />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Suggestions & Explanations
            </h3>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {errors.map((error, i) => {
              const color = typeColors[error.type] || typeColors.grammar;

              return (
                <motion.div
                  key={error.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className={`rounded-[20px] p-6 border transition-colors ${
                    darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      {/* Type badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${color.bg}`}
                          style={{ color: color.accent }}
                        >
                          {color.label} Error
                        </span>
                        <span className={`text-xs font-medium ${darkMode ? 'text-[#475569]' : 'text-[#CBD5E1]'}`}>
                          {error.rule}
                        </span>
                      </div>

                      {/* Original → Suggestion */}
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className={`px-4 py-2 rounded-xl border ${darkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#FEF2F2] border-[#FECACA]'}`}>
                          <span className={`text-sm font-medium ${darkMode ? 'text-[#F87171]' : 'text-[#EF4444]'}`}>
                            {error.original}
                          </span>
                        </div>
                        <ArrowRight className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-[#475569]' : 'text-[#CBD5E1]'}`} />
                        <div className={`px-4 py-2 rounded-xl border ${darkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#F0FDF4] border-[#BBF7D0]'}`}>
                          <span className={`text-sm font-semibold ${darkMode ? 'text-[#4ADE80]' : 'text-[#22C55E]'}`}>
                            {error.suggestion}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                        {error.explanation}
                      </p>

                      {/* Confidence bar */}
                      <div className="flex items-center gap-3">
                        <Gauge className={`w-3.5 h-3.5 ${darkMode ? 'text-[#475569]' : 'text-[#CBD5E1]'}`} />
                        <span className={`text-xs font-medium ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                          Confidence
                        </span>
                        <div className={`flex-1 max-w-32 h-1.5 rounded-full ${darkMode ? 'bg-[#0F172A]' : 'bg-[#F1F5F9]'}`}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED]"
                            style={{ width: `${error.confidence}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${darkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'}`}>
                          {error.confidence}%
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onApply(error.id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-sm font-semibold shadow-md shadow-[#22C55E]/20 hover:shadow-lg transition-shadow flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      Apply
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
