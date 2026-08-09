import { motion } from 'framer-motion';
import { ArrowDown, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface CorrectedOutputProps {
  darkMode: boolean;
  originalText: string;
  correctedText: string;
}

export default function CorrectedOutput({ darkMode, originalText, correctedText }: CorrectedOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isChanged = originalText !== correctedText;

  return (
    <section className="py-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#22C55E]" />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              {isChanged ? 'Original vs Corrected' : 'No Corrections Needed'}
            </h3>
          </div>

          <div
            className={`rounded-[20px] border overflow-hidden ${
              darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
            }`}
          >
            {/* Original */}
            <div className={`p-6 border-b ${darkMode ? 'border-[#334155]' : 'border-[#F1F5F9]'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  Original
                </span>
              </div>
              <p className={`text-base leading-relaxed ${darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                {originalText}
              </p>
            </div>

            {/* Arrow */}
            {isChanged && (
              <div className="flex justify-center py-3">
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-[#0F172A]' : 'bg-[#F1F5F9]'
                  }`}
                >
                  <ArrowDown className={`w-4 h-4 ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`} />
                </motion.div>
              </div>
            )}

            {/* Corrected */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                    Corrected
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    copied
                      ? 'bg-[#22C55E]/10 text-[#22C55E]'
                      : darkMode
                        ? 'text-[#64748B] hover:bg-[#334155]'
                        : 'text-[#94A3B8] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className={`text-base leading-relaxed font-medium ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                {correctedText}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
