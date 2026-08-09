// import { PenLine, ExternalLink, Code2 } from 'lucide-react';

// interface FooterProps {
//   darkMode: boolean;
// }

// const techStack = [
//   { name: 'Python', color: '#3776AB' },
//   { name: 'NLTK', color: '#154F5B' },
//   { name: 'spaCy', color: '#09A3D5' },
//   { name: 'Machine Learning', color: '#7C3AED' },
//   { name: 'React', color: '#61DAFB' },
//   { name: 'TypeScript', color: '#3178C6' },
// ];

// export default function Footer({ darkMode }: FooterProps) {
//   return (
//     <footer
//       id="footer"
//       className={`border-t ${darkMode ? 'bg-[#0B1120] border-[#1E293B]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}
//     >
//       <div className="max-w-6xl mx-auto px-6 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
//           {/* Brand */}
//           <div>
//             <div className="flex items-center gap-2.5 mb-4">
//               <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center">
//                 <PenLine className="w-4 h-4 text-white" />
//               </div>
//               <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
//                 Grammar<span className="text-[#2563EB]">AI</span>
//               </span>
//             </div>
//             <p className={`text-sm leading-relaxed ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
//               AI-powered grammar error detection using Natural Language Processing. Built as an NLP
//               research project demonstrating modern text analysis techniques.
//             </p>
//           </div>

//           {/* Built with */}
//           <div>
//             <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
//               Built Using
//             </h4>
//             <div className="flex flex-wrap gap-2">
//               {techStack.map((tech) => (
//                 <span
//                   key={tech.name}
//                   className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${
//                     darkMode ? 'bg-[#1E293B] border-[#334155] text-[#94A3B8]' : 'bg-white border-[#E2E8F0] text-[#64748B]'
//                   }`}
//                 >
//                   <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: tech.color }} />
//                   {tech.name}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Links */}
//           <div>
//             <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
//               Links
//             </h4>
//             <div className="space-y-3">
//               {[
//                 { label: 'Source Code', icon: Code2, href: '#' },
//                 { label: 'Documentation', icon: ExternalLink, href: '#pipeline' },
//                 { label: 'NLP Pipeline', icon: ExternalLink, href: '#pipeline' },
//               ].map((link) => {
//                 const Icon = link.icon;
//                 return (
//                   <a
//                     key={link.label}
//                     href={link.href}
//                     className={`flex items-center gap-2 text-sm transition-colors ${
//                       darkMode ? 'text-[#64748B] hover:text-[#2563EB]' : 'text-[#94A3B8] hover:text-[#2563EB]'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     {link.label}
//                   </a>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         <div className={`mt-12 pt-8 border-t text-center ${darkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'}`}>
//           <p className={`text-sm ${darkMode ? 'text-[#475569]' : 'text-[#CBD5E1]'}`}>
//             © 2026 GrammarAI. Built with ❤️ for NLP research.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }




export default function Footer() {
  const techStack = [
    { name: 'Python', icon: '🐍' },
    { name: 'NLTK', icon: '📚' },
    { name: 'spaCy', icon: '🧠' },
    { name: 'Machine Learning', icon: '🤖' },
  ];

  const links = [
    {
      title: 'Product',
      items: ['Features', 'Documentation', 'API Reference', 'Pricing'],
    },
    {
      title: 'Resources',
      items: ['Blog', 'Tutorials', 'NLP Guide', 'Grammar Rules'],
    },
    {
      title: 'Company',
      items: ['About', 'Careers', 'Contact', 'Privacy'],
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                Grammar<span className="text-blue-400">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Advanced grammar error detection powered by Natural Language Processing. 
              Improve your writing with AI-powered analysis and suggestions.
            </p>
            
            {/* Tech stack */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Built using</p>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700"
                  >
                    <span>{tech.icon}</span>
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          {links.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 GrammarAI. Built with ❤️ for better writing.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
