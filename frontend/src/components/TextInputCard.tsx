import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, FileText, RefreshCw, ListChecks } from 'lucide-react';
import { countWords, countCharacters } from '../lib/grammarEngine';

interface TextInputCardProps {
  darkMode: boolean;
  text: string;
  setText: (v: string) => void;
  onAnalyze: () => void;
  onParaphrase: () => void;
  onSummary: () => void;
  paraphrasedText: string;
  summaryText: string;
  isAnalyzing: boolean;
  isParaphrasing: boolean;
  isSummarizing: boolean;
}

const exampleSentences = [
  'She go to school yesterday and dont study for teh exam.',
  'Me and him was going to the store but their was nothing their.',
  'He have alot of work to do and she dont know about it.',
  'The childs was playing in teh park and they was very happy.',
  'I could of went to the party but your not invited irregardless.',
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
  isAnalyzing,
  isParaphrasing,
  isSummarizing,
}: TextInputCardProps) {
  const words = countWords(text);
  const chars = countCharacters(text);

  const loadExample = () => {
    const random = exampleSentences[Math.floor(Math.random() * exampleSentences.length)];
    setText(random);
  };

  return (
    <section id="input-section" className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`rounded-[24px] p-8 md:p-10 shadow-xl border transition-colors ${
            darkMode
              ? 'bg-[#1E293B] border-[#334155] shadow-black/30'
              : 'bg-white border-[#E2E8F0] shadow-[#2563EB]/5'
          }`}
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-white" />
              </div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                Paste your text
              </h2>
            </div>
            <button
              onClick={loadExample}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                darkMode
                  ? 'text-[#94A3B8] hover:bg-[#334155]'
                  : 'text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try Example
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your sentence here..."
            rows={6}
            className={`w-full rounded-2xl p-6 text-base leading-relaxed resize-none outline-none transition-all border-2 focus:ring-4 ${
              darkMode
                ? 'bg-[#0F172A] border-[#334155] text-white placeholder:text-[#475569] focus:border-[#2563EB] focus:ring-[#2563EB]/10'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-[#2563EB]/10'
            }`}
          />

          <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  Words
                </span>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  {words}
                </span>
              </div>
              <div className={`w-px h-4 ${darkMode ? 'bg-[#334155]' : 'bg-[#E2E8F0]'}`} />
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  Characters
                </span>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  {chars}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-[15px] transition-all ${
                  !text.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-[#2563EB]/25 hover:shadow-xl'
                }`}
              >
                <Sparkles className="w-4.5 h-4.5" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onParaphrase}
                disabled={!text.trim() || isParaphrasing}
                className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-[15px] transition-all ${
                  !text.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-[#10B981]/20 hover:shadow-xl'
                }`}
              >
                <RefreshCw className="w-4.5 h-4.5" />
                {isParaphrasing ? 'Rephrasing...' : 'Paraphrase'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSummary}
                disabled={!text.trim() || isSummarizing}
                className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-[15px] transition-all ${
                  !text.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/20 hover:shadow-xl'
                }`}
              >
                <ListChecks className="w-4.5 h-4.5" />
                {isSummarizing ? 'Summarizing...' : 'Summary'}
              </motion.button>
            </div>
          </div>

          {(paraphrasedText || summaryText) && (
            <div className={`mt-6 grid gap-4 rounded-2xl p-5 border ${darkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
              {paraphrasedText && (
                <div>
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.12em] ${darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    Paraphrase
                  </p>
                  <p className={`text-sm leading-7 ${darkMode ? 'text-slate-100' : 'text-slate-700'}`}>
                    {paraphrasedText}
                  </p>
                </div>
              )}

              {summaryText && (
                <div>
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.12em] ${darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    Summary
                  </p>
                  <p className={`text-sm leading-7 ${darkMode ? 'text-slate-100' : 'text-slate-700'}`}>
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
