import { motion } from 'framer-motion';
import { Type, SpellCheck, BookOpen, Braces } from 'lucide-react';
import type { AnalysisResult } from '../lib/grammarEngine';

interface ErrorBreakdownProps {
  darkMode: boolean;
  result: AnalysisResult;
}

export default function ErrorBreakdown({ darkMode, result }: ErrorBreakdownProps) {
  const categories = [
    {
      label: 'Grammar',
      count: result.errorBreakdown.grammar,
      icon: Type,
      color: '#EF4444',
      bgColor: 'bg-[#EF4444]/10',
      barColor: 'bg-[#EF4444]',
    },
    {
      label: 'Spelling',
      count: result.errorBreakdown.spelling,
      icon: SpellCheck,
      color: '#F59E0B',
      bgColor: 'bg-[#F59E0B]/10',
      barColor: 'bg-[#F59E0B]',
    },
    {
      label: 'Punctuation',
      count: result.errorBreakdown.punctuation,
      icon: BookOpen,
      color: '#2563EB',
      bgColor: 'bg-[#2563EB]/10',
      barColor: 'bg-[#2563EB]',
    },
    {
      label: 'Syntax',
      count: result.errorBreakdown.syntax,
      icon: Braces,
      color: '#7C3AED',
      bgColor: 'bg-[#7C3AED]/10',
      barColor: 'bg-[#7C3AED]',
    },
  ];

  const maxCount = Math.max(...categories.map((c) => c.count), 1);

  return (
    <section className="py-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Error Breakdown
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className={`rounded-[20px] p-6 border transition-colors ${
                    darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${cat.bgColor} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <span
                      className="text-3xl font-bold"
                      style={{ color: cat.color }}
                    >
                      {cat.count}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold mb-3 ${darkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'}`}>
                    {cat.label}
                  </p>
                  <div className={`h-1.5 rounded-full ${darkMode ? 'bg-[#0F172A]' : 'bg-[#F1F5F9]'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cat.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      className={`h-full rounded-full ${cat.barColor}`}
                    />
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
