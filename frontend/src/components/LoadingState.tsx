import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Brain, TextSearch, Tags, ShieldCheck } from 'lucide-react';

interface LoadingStateProps {
  darkMode: boolean;
}

const steps = [
  { label: 'Sentence Tokenization', icon: TextSearch, duration: 700 },
  { label: 'POS Tagging', icon: Tags, duration: 900 },
  { label: 'Grammar Detection', icon: Brain, duration: 1100 },
  { label: 'Generating Suggestions', icon: ShieldCheck, duration: 800 },
];

export default function LoadingState({ darkMode }: LoadingStateProps) {
  const [progress, setProgress] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let cumDelay = 0;

    steps.forEach((step, i) => {
      const startTimer = setTimeout(() => {
        const interval = setInterval(() => {
          setProgress((prev) => {
            const next = [...prev];
            next[i] = Math.min(next[i] + Math.random() * 15 + 5, 100);
            return next;
          });
        }, 50);
        timers.push(interval as unknown as NodeJS.Timeout);

        const stopTimer = setTimeout(() => {
          clearInterval(interval);
          setProgress((prev) => {
            const next = [...prev];
            next[i] = 100;
            return next;
          });
        }, step.duration);
        timers.push(stopTimer);
      }, cumDelay);
      timers.push(startTimer);
      cumDelay += step.duration * 0.6;
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="py-20">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-[24px] p-8 md:p-10 border ${
            darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center"
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                Analyzing...
              </h3>
              <p className={`text-sm ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                Processing your text through the NLP pipeline
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const pct = Math.round(progress[i]);
              const isComplete = pct >= 100;

              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isComplete ? 'text-[#22C55E]' : 'text-[#2563EB]'}`} />
                      <span
                        className={`text-sm font-medium ${
                          darkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isComplete ? 'text-[#22C55E]' : darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'
                      }`}
                    >
                      {isComplete ? '✓ Complete' : `${pct}%`}
                    </span>
                  </div>
                  <div
                    className={`h-2.5 rounded-full overflow-hidden ${
                      darkMode ? 'bg-[#0F172A]' : 'bg-[#F1F5F9]'
                    }`}
                  >
                    <motion.div
                      className={`h-full rounded-full transition-all duration-100 ${
                        isComplete
                          ? 'bg-gradient-to-r from-[#22C55E] to-[#4ADE80]'
                          : 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED]'
                      }`}
                      style={{ width: `${pct}%` }}
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
