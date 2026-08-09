// import { motion } from 'framer-motion';
// import { FileText, SplitSquareHorizontal, Tags, Brain, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';

// interface NLPPipelineProps {
//   darkMode: boolean;
// }

// const pipelineSteps = [
//   {
//     icon: FileText,
//     emoji: '📝',
//     label: 'Input',
//     description: 'Raw text input from user',
//     color: '#64748B',
//   },
//   {
//     icon: SplitSquareHorizontal,
//     emoji: '🔠',
//     label: 'Tokenization',
//     description: 'Split text into tokens',
//     color: '#2563EB',
//   },
//   {
//     icon: Tags,
//     emoji: '🏷️',
//     label: 'POS Tagging',
//     description: 'Part-of-speech identification',
//     color: '#7C3AED',
//   },
//   {
//     icon: Brain,
//     emoji: '🧠',
//     label: 'Grammar Rules',
//     description: 'Apply grammar rule engine',
//     color: '#F59E0B',
//   },
//   {
//     icon: AlertTriangle,
//     emoji: '⚠️',
//     label: 'Error Detection',
//     description: 'Identify grammar issues',
//     color: '#EF4444',
//   },
//   {
//     icon: Sparkles,
//     emoji: '✨',
//     label: 'Correction',
//     description: 'Generate suggestions',
//     color: '#8B5CF6',
//   },
//   {
//     icon: CheckCircle,
//     emoji: '✅',
//     label: 'Output',
//     description: 'Corrected text output',
//     color: '#22C55E',
//   },
// ];

// export default function NLPPipeline({ darkMode }: NLPPipelineProps) {
//   return (
//     <section id="pipeline" className="py-20">
//       <div className="max-w-6xl mx-auto px-6">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-14"
//         >
//           <h2 className={`text-[28px] font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
//             NLP Processing Pipeline
//           </h2>
//           <p className={`text-base max-w-xl mx-auto ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
//             See how your text flows through our Natural Language Processing engine
//           </p>
//         </motion.div>

//         {/* Pipeline - horizontal on desktop, vertical on mobile */}
//         <div className="hidden lg:flex items-start justify-between relative">
//           {/* Connecting line */}
//           <div className={`absolute top-10 left-[10%] right-[10%] h-0.5 ${darkMode ? 'bg-[#334155]' : 'bg-[#E2E8F0]'}`}>
//             <motion.div
//               initial={{ width: '0%' }}
//               whileInView={{ width: '100%' }}
//               viewport={{ once: true }}
//               transition={{ duration: 1.5, ease: 'easeInOut' }}
//               className="h-full bg-gradient-to-r from-[#2563EB] to-[#22C55E]"
//             />
//           </div>

//           {pipelineSteps.map((step, i) => {
//             const Icon = step.icon;
//             return (
//               <motion.div
//                 key={step.label}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.12 }}
//                 className="flex flex-col items-center relative z-10 w-[120px]"
//               >
//                 <motion.div
//                   whileHover={{ scale: 1.1, y: -4 }}
//                   className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border shadow-lg transition-colors ${
//                     darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
//                   }`}
//                   style={{ boxShadow: `0 8px 24px ${step.color}15` }}
//                 >
//                   <Icon className="w-7 h-7" style={{ color: step.color }} />
//                 </motion.div>
//                 <span className={`text-sm font-semibold mb-1 text-center ${darkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'}`}>
//                   {step.label}
//                 </span>
//                 <span className={`text-xs text-center leading-snug ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
//                   {step.description}
//                 </span>
//               </motion.div>
//             );
//           })}
//         </div>

//         {/* Mobile: vertical pipeline */}
//         <div className="lg:hidden space-y-0">
//           {pipelineSteps.map((step, i) => {
//             const Icon = step.icon;
//             return (
//               <motion.div
//                 key={step.label}
//                 initial={{ opacity: 0, x: -20 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.08 }}
//               >
//                 <div className="flex items-center gap-5">
//                   <div className="flex flex-col items-center">
//                     <div
//                       className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
//                         darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'
//                       }`}
//                     >
//                       <Icon className="w-6 h-6" style={{ color: step.color }} />
//                     </div>
//                     {i < pipelineSteps.length - 1 && (
//                       <div className={`w-0.5 h-8 ${darkMode ? 'bg-[#334155]' : 'bg-[#E2E8F0]'}`} />
//                     )}
//                   </div>
//                   <div className="pb-8">
//                     <span className={`text-sm font-semibold ${darkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'}`}>
//                       {step.label}
//                     </span>
//                     <p className={`text-xs ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
//                       {step.description}
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }




import { useEffect, useState, useRef } from 'react';

interface NLPPipelineProps {
  darkMode: boolean;
}

const pipelineSteps = [
  {
    id: 1,
    icon: '📝',
    label: 'Input',
    description: 'Raw text input from the UI',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    darkBgColor: 'dark:bg-blue-950/40',
    darkBorderColor: 'dark:border-blue-900',
  },
  {
    id: 2,
    icon: '🔤',
    label: 'Tokenization',
    description: 'Breaking text into words and tokens',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    darkBgColor: 'dark:bg-indigo-950/40',
    darkBorderColor: 'dark:border-indigo-900',
  },
  {
    id: 3,
    icon: '🏷️',
    label: 'POS Tagging',
    description: 'Identifying parts of speech',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-100',
    darkBgColor: 'dark:bg-violet-950/40',
    darkBorderColor: 'dark:border-violet-900',
  },
  {
    id: 4,
    icon: '🧠',
    label: 'Grammar Rules',
    description: 'Applying linguistic rules',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    darkBgColor: 'dark:bg-purple-950/40',
    darkBorderColor: 'dark:border-purple-900',
  },
  {
    id: 5,
    icon: '⚠️',
    label: 'Error Detection',
    description: 'Finding grammar and spelling errors',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    darkBgColor: 'dark:bg-amber-950/40',
    darkBorderColor: 'dark:border-amber-900',
  },
  {
    id: 6,
    icon: '✨',
    label: 'Correction',
    description: 'Generating context-aware fixes',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    darkBgColor: 'dark:bg-green-950/40',
    darkBorderColor: 'dark:border-green-900',
  },
  {
    id: 7,
    icon: '✅',
    label: 'Output',
    description: 'Corrected text with analysis',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    darkBgColor: 'dark:bg-emerald-950/40',
    darkBorderColor: 'dark:border-emerald-900',
  },
];

export default function NLPPipeline({ darkMode }: NLPPipelineProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let step = 0;
    const interval = setInterval(() => {
      if (step >= pipelineSteps.length) {
        clearInterval(interval);
        return;
      }
      setActiveStep(step);
      step++;
    }, 600);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={`scroll-mt-24 py-20 ${
        darkMode
          ? 'bg-gradient-to-b from-slate-950 to-slate-900'
          : 'bg-gradient-to-b from-white to-slate-50'
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border ${
              darkMode
                ? 'bg-violet-950/40 border-violet-900'
                : 'bg-violet-50 border-violet-100'
            }`}
          >
            <svg
              className={`h-4 w-4 ${
                darkMode ? 'text-violet-400' : 'text-violet-600'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              className={`text-sm font-medium ${
                darkMode ? 'text-violet-300' : 'text-violet-700'
              }`}
            >
              How It Works
            </span>
          </div>

          <h2
            className={`text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            NLP Processing Pipeline
          </h2>

          <p
            className={`text-lg max-w-2xl mx-auto ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Our advanced Natural Language Processing pipeline analyzes your text
            through multiple stages to ensure accurate error detection.
          </p>
        </div>

        {/* Pipeline visualization */}
        <div className="relative">
          {/* Connection line */}
          <div
            className={`absolute top-1/2 left-0 right-0 h-0.5 hidden xl:block -translate-y-1/2 z-0 ${
              darkMode
                ? 'bg-gradient-to-r from-blue-900 via-violet-900 to-emerald-900'
                : 'bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200'
            }`}
          />

          {/* Cards grid: fewer columns on smaller screens, 7 only on very wide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-6 relative z-10">
            {pipelineSteps.map((step, index) => {
              const isActive = index <= activeStep;
              const isCurrent = index === activeStep;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.5s ease-out',
                    transitionDelay: `${index * 150}ms`,
                  }}
                >
                  {/* Step card */}
                  <div
                    className={`
                      relative
                      flex
                      flex-col
                      h-[255px]
                      w-full
                      max-w-[220px]
                      mx-auto
                      rounded-3xl
                      px-6
                      py-6
                      border-2
                      transition-all
                      duration-500
                      ${
                        isActive
                          ? darkMode
                            ? 'bg-slate-900 border-slate-700 shadow-lg shadow-black/40'
                            : 'bg-white shadow-lg shadow-slate-200/50 border-slate-200'
                          : darkMode
                          ? 'bg-slate-900/40 border-slate-800'
                          : 'bg-white/50 border-slate-100'
                      }
                      ${
                        isCurrent
                          ? darkMode
                            ? 'ring-4 ring-blue-900 scale-105'
                            : 'ring-4 ring-blue-100 scale-105'
                          : ''
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500" />
                      </div>
                    )}

                    {/* Number badge */}
                    <div
                      className={`absolute -top-4 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                          : darkMode
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step.id}
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center items-center h-14 mb-4">
                      <span className="text-4xl">{step.icon}</span>
                    </div>

                    {/* Title */}
                    <div
                      className={`text-base font-semibold mb-3 transition-colors duration-300 ${
                        isActive
                          ? darkMode
                            ? 'text-slate-100'
                            : 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </div>

                    {/* Description */}
                    <p
                      className={`
                        text-sm
                        leading-6
                        text-center
                        min-h-[72px]
                        flex
                        items-start
                        justify-center
                        max-w-[160px]
                        mx-auto
                        transition-colors
                        duration-300
                        ${
                          isActive
                            ? darkMode
                              ? 'text-slate-400'
                              : 'text-slate-500'
                            : darkMode
                            ? 'text-slate-600'
                            : 'text-slate-300'
                        }
                      `}
                    >
                      {step.description}
                    </p>

                    {/* Spacer + Progress bar at bottom */}
                    <div className="mt-auto pt-5">
                      {isActive && (
                        <div>
                          <div
                            className={`h-1.5 rounded-full overflow-hidden ${
                              darkMode ? 'bg-slate-800' : 'bg-slate-100'
                            }`}
                          >
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                              style={{ width: isCurrent ? '100%' : '100%' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrows between cards (only on xl+ and between visible neighbors) */}
                  {index < pipelineSteps.length - 1 && (
                    <div
                      className="hidden xl:block absolute"
                      style={{
                        left: `${((index + 1) / 7) * 100 - 1}%`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      <svg
                        className={`h-4 w-4 transition-colors duration-300 ${
                          index < activeStep
                            ? 'text-blue-500'
                            : darkMode
                            ? 'text-slate-700'
                            : 'text-slate-300'
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-16 text-center">
          <div
            className={`inline-flex items-center gap-8 px-8 py-4 rounded-2xl border shadow-sm ${
              darkMode
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                className={`h-5 w-5 ${
                  darkMode ? 'text-blue-400' : 'text-blue-500'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span
                className={`text-sm ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Processing time:{' '}
                <span
                  className={`font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  &lt; 50ms
                </span>
              </span>
            </div>

            <div
              className={`h-6 w-px ${
                darkMode ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            />

            <div className="flex items-center gap-2">
              <svg
                className={`h-5 w-5 ${
                  darkMode ? 'text-green-400' : 'text-green-500'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span
                className={`text-sm ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Accuracy:{' '}
                <span
                  className={`font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  99%
                </span>
              </span>
            </div>

            <div
              className={`h-6 w-px ${
                darkMode ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            />

            <div className="flex items-center gap-2">
              <svg
                className={`h-5 w-5 ${
                  darkMode ? 'text-violet-400' : 'text-violet-500'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span
                className={`text-sm ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Stages:{' '}
                <span
                  className={`font-bold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {pipelineSteps.length}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}