import { motion } from 'framer-motion';
import { Target, AlertTriangle, BookOpen, Gauge } from 'lucide-react';
import type { AnalysisResult } from '../lib/grammarEngine';

interface ResultsDashboardProps {
  darkMode: boolean;
  result: AnalysisResult;
}

export default function ResultsDashboard({ darkMode, result }: ResultsDashboardProps) {
  const cards = [
    {
      label: 'Score',
      value: `${result.score}/100`,
      icon: Target,
      color: result.score >= 80 ? 'from-[#22C55E] to-[#4ADE80]' : result.score >= 50 ? 'from-[#F59E0B] to-[#FBBF24]' : 'from-[#EF4444] to-[#F87171]',
      bgColor: result.score >= 80 ? 'bg-[#22C55E]/10' : result.score >= 50 ? 'bg-[#F59E0B]/10' : 'bg-[#EF4444]/10',
      iconColor: result.score >= 80 ? 'text-[#22C55E]' : result.score >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]',
    },
    {
      label: 'Errors Found',
      value: result.errors.length.toString(),
      icon: AlertTriangle,
      color: result.errors.length === 0 ? 'from-[#22C55E] to-[#4ADE80]' : 'from-[#EF4444] to-[#F87171]',
      bgColor: result.errors.length === 0 ? 'bg-[#22C55E]/10' : 'bg-[#EF4444]/10',
      iconColor: result.errors.length === 0 ? 'text-[#22C55E]' : 'text-[#EF4444]',
    },
    {
      label: 'Readability',
      value: result.readability,
      icon: BookOpen,
      color: 'from-[#2563EB] to-[#3B82F6]',
      bgColor: 'bg-[#2563EB]/10',
      iconColor: 'text-[#2563EB]',
    },
    {
      label: 'Confidence',
      value: `${result.confidence}%`,
      icon: Gauge,
      color: 'from-[#7C3AED] to-[#8B5CF6]',
      bgColor: 'bg-[#7C3AED]/10',
      iconColor: 'text-[#7C3AED]',
    },
  ];

  return (
    <section className="py-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`text-[28px] font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Analysis Results
          </h2>
          <p className={`text-base mb-8 ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
            AI-powered grammar analysis complete
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-[20px] p-6 border transition-colors ${
                    darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl ${card.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                    {card.label}
                  </p>
                  <p className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                    {card.value}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
