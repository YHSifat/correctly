import { useState, useEffect } from 'react';
import { Moon, Sun, PenLine, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  onTryNow: () => void;
}

export default function Navbar({ darkMode, setDarkMode, onTryNow }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 h-[80px] flex items-center transition-all duration-300 ${
        scrolled
          ? darkMode
            ? 'bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#334155]'
            : 'bg-white/90 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0 })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-lg">
            <PenLine className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Grammar<span className="text-[#2563EB]">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => window.scrollTo({ top: 0 })}
            className={`text-[15px] font-medium transition-colors hover:text-[#2563EB] ${
              darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            Home
          </button>
          <button
            onClick={onTryNow}
            className={`text-[15px] font-medium transition-colors hover:text-[#2563EB] ${
              darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            Analyze
          </button>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById('how-it-works')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`text-[15px] font-medium transition-colors hover:text-[#2563EB] ${
              darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            Documentation
          </a>
          <a
            href="#footer"
            className={`text-[15px] font-medium transition-colors hover:text-[#2563EB] ${
              darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            {/* About */}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              darkMode
                ? 'bg-[#1E293B] text-yellow-400 hover:bg-[#334155]'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              darkMode ? 'bg-[#1E293B] text-white' : 'bg-[#F1F5F9] text-[#0F172A]'
            }`}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-[80px] left-0 right-0 md:hidden border-b ${
              darkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-[#E2E8F0]'
            }`}
          >
            <div className="flex flex-col p-4 gap-2">
              {['Home', 'Analyze', 'Documentation'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMenuOpen(false);
                    if (item === 'Analyze') {
                      onTryNow();
                    } else if (item === 'Documentation') {
                      document
                        .getElementById('how-it-works')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`text-left px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                    darkMode ? 'text-[#94A3B8] hover:bg-[#1E293B]' : 'text-[#64748B] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
