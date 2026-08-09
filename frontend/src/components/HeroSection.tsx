import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Type, SpellCheck, BookOpen, Braces } from 'lucide-react';

interface HeroSectionProps {
  darkMode: boolean;
  onTryNow: () => void;
}

const floatingCards = [
  { label: 'Grammar', icon: Type, color: 'from-[#2563EB] to-[#3B82F6]', delay: 0 },
  { label: 'Spelling', icon: SpellCheck, color: 'from-[#7C3AED] to-[#8B5CF6]', delay: 0.5 },
  { label: 'Punctuation', icon: BookOpen, color: 'from-[#F59E0B] to-[#FBBF24]', delay: 1.0 },
  { label: 'Syntax', icon: Braces, color: 'from-[#22C55E] to-[#4ADE80]', delay: 1.5 },
];

export default function HeroSection({ darkMode, onTryNow }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-[80px] overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 ${
            darkMode ? 'bg-[#2563EB]' : 'bg-[#2563EB]'
          }`}
        />
        <div
          className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-15 ${
            darkMode ? 'bg-[#7C3AED]' : 'bg-[#7C3AED]'
          }`}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10 border border-[#2563EB]/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span className="text-sm font-medium text-[#2563EB]">NLP-Powered Analysis</span>
          </motion.div>

          <h1
            className={`text-[48px] lg:text-[56px] font-extrabold leading-[1.1] tracking-tight mb-6 ${
              darkMode ? 'text-white' : 'text-[#0F172A]'
            }`}
          >
            Detect Grammar Errors with{' '}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          <p
            className={`text-lg leading-relaxed mb-10 max-w-lg ${
              darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            Analyze grammar, spelling, punctuation, and sentence structure within seconds using
            advanced Natural Language Processing techniques.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onTryNow}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold text-base shadow-xl shadow-[#2563EB]/25 hover:shadow-2xl transition-shadow"
            >
              Try Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('how-it-works')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base border transition-colors ${
                darkMode
                  ? 'border-[#334155] text-[#94A3B8] hover:bg-[#1E293B]'
                  : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-12 flex-wrap">
            {[
              { value: '98%', label: 'Accuracy' },
              { value: '50+', label: 'Grammar Rules' },
              { value: '<1s', label: 'Analysis Time' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side: floating cards illustration */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="relative hidden lg:flex items-center justify-center min-h-[500px]"
        >
          {/* Central AI brain */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-40 h-40 rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-2xl shadow-[#2563EB]/30 relative z-10"
          >
            <div className="text-center text-white">
              <div className="text-3xl mb-1">🧠</div>
              <div className="text-sm font-semibold">NLP Engine</div>
            </div>
          </motion.div>

          {/* Floating cards */}
          {floatingCards.map((card, i) => {
            const positions = [
              { x: -160, y: -140 },
              { x: 160, y: -100 },
              { x: -180, y: 120 },
              { x: 150, y: 140 },
            ];
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + card.delay * 0.3, type: 'spring' }}
                className="absolute"
                style={{ left: `calc(50% + ${positions[i].x}px)`, top: `calc(50% + ${positions[i].y}px)` }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  className={`px-5 py-3.5 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-xl flex items-center gap-2.5`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span className="text-sm font-semibold whitespace-nowrap">{card.label}</span>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Connection lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            {[
              { x1: '50%', y1: '50%', x2: 'calc(50% - 130px)', y2: 'calc(50% - 120px)' },
              { x1: '50%', y1: '50%', x2: 'calc(50% + 180px)', y2: 'calc(50% - 80px)' },
              { x1: '50%', y1: '50%', x2: 'calc(50% - 150px)', y2: 'calc(50% + 135px)' },
              { x1: '50%', y1: '50%', x2: 'calc(50% + 170px)', y2: 'calc(50% + 155px)' },
            ].map((line, i) => (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={darkMode ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.2)'}
                strokeWidth="1.5"
                strokeDasharray="6,6"
              />
            ))}
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
