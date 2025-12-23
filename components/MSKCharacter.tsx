
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../App';
import { MSK_CONTENT_POOL, MSKContent } from '../constants';
import { UserRole } from '../types';

const MSKCharacter: React.FC = () => {
  const { currentUser, language, t, isMSKEnabled, darkMode } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<MSKContent | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastIds, setLastIds] = useState<string[]>([]);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const hasGreeted = useRef(false);

  // Auto-greet on mount
  useEffect(() => {
    if (isMSKEnabled && !hasGreeted.current) {
      const timer = setTimeout(() => {
        const greetingText = currentUser 
          ? t('mskGreetingNamed').replace('{name}', currentUser.name.split(' ')[0])
          : t('mskGreeting');
        
        setContent({
          id: 'greeting',
          type: 'GREETING',
          role: 'BOTH',
          lang: language,
          text: greetingText
        });
        setIsOpen(true);
        hasGreeted.current = true;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isMSKEnabled, language, currentUser, t]);

  useEffect(() => {
    if (isOpen && content?.type === 'GREETING') {
       const greetingText = currentUser 
          ? t('mskGreetingNamed').replace('{name}', currentUser.name.split(' ')[0])
          : t('mskGreeting');
       setContent(prev => prev ? {...prev, text: greetingText, lang: language} : null);
    }
  }, [language, t, currentUser, isOpen, content?.type]);

  const getRandomContent = () => {
    const currentRole = currentUser?.role || UserRole.PATIENT;
    const pool = MSK_CONTENT_POOL.filter(c => 
      c.lang === language &&
      (c.role === currentRole || c.role === 'BOTH') && 
      !lastIds.includes(c.id)
    );
    
    if (pool.length === 0) {
      setLastIds([]);
      const fallback = MSK_CONTENT_POOL.find(c => c.lang === language) || MSK_CONTENT_POOL[0];
      setContent(fallback);
      return;
    }
    
    const item = pool[Math.floor(Math.random() * pool.length)];
    setContent(item);
    setLastIds(prev => [...prev.slice(-2), item.id]);
    setSelectedOption(null);
    setFeedback(null);
  };

  const handleInteract = () => {
    if (!isOpen || content?.type === 'GREETING') {
      getRandomContent();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (content?.type === 'QUIZ') {
      const isCorrect = idx === content.answer;
      setFeedback(isCorrect ? t('correct') : t('incorrect'));
    }
  };

  // Dynamic colors based on theme
  const colors = useMemo(() => ({
    bone: darkMode ? '#f1f5f9' : '#475569',
    muscle: darkMode ? '#fb7185' : '#e11d48',
    fascia: darkMode ? '#38bdf8' : '#0ea5e9',
    glow: darkMode ? 'rgba(20, 184, 166, 0.4)' : 'rgba(20, 184, 166, 0.2)',
  }), [darkMode]);

  if (!isMSKEnabled) return null;

  return (
    <div 
      className={`fixed bottom-8 ${language === 'ar' ? 'left-8' : 'right-8'} z-[100] flex flex-col items-end pointer-events-none`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] transition-all duration-700 -z-10" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && content && (
        <div className="mb-6 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-6 pointer-events-auto animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 origin-bottom-right">
          
          <div className="flex justify-between items-start mb-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full shadow-sm">
               {content.type === 'GREETING' ? (language === 'ar' ? 'ترحيب' : 'GREETING') : content.type}
             </span>
             <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" aria-label="Close">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          
          <p className="text-base font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">{content.text}</p>

          {content.type === 'QUIZ' && content.options && (
            <div className="space-y-3">
              {content.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-start p-4 rounded-2xl text-sm font-bold border transition-all duration-300 ${
                    selectedOption === idx 
                      ? (idx === content.answer ? 'bg-green-500 text-white border-green-500 shadow-lg' : 'bg-red-500 text-white border-red-500 shadow-lg')
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {opt}
                    {selectedOption === idx && (
                      <span>{idx === content.answer ? '✓' : '✕'}</span>
                    )}
                  </div>
                </button>
              ))}
              {selectedOption !== null && content.explanation && (
                <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl text-xs text-slate-700 dark:text-slate-300 border border-teal-100 dark:border-teal-800 animate-in slide-in-from-top-2 italic">
                  {content.explanation}
                </div>
              )}
            </div>
          )}

          {(content.type === 'FACT' || content.type === 'JOKE') && (
             <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={() => getRandomContent()} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-teal-500 hover:text-white transition-all shadow-sm">{t('interesting')}</button>
                <button onClick={() => setIsOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-pink-500 hover:text-white transition-all shadow-sm">{t('funny')}</button>
             </div>
          )}

          {content.type === 'GREETING' && (
             <button onClick={() => handleInteract()} className="w-full mt-4 py-4 bg-teal-600 text-white rounded-2xl text-sm font-black hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20">{language === 'ar' ? 'لنباشر!' : 'Let\'s go!'}</button>
          )}

          {feedback && (
            <div className={`mt-4 text-center text-sm font-black animate-bounce ${feedback === t('correct') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {feedback}
            </div>
          )}
        </div>
      )}

      {/* The Animated Biological Figure */}
      <button 
        onClick={handleInteract}
        className="pointer-events-auto group relative w-24 h-32 flex items-center justify-center transition-all hover:scale-105 active:scale-90 duration-500 focus:outline-none"
        aria-label={t('mskCompanion')}
        onMouseEnter={() => setHoveredPart('body')}
        onMouseLeave={() => setHoveredPart(null)}
      >
        <div className="absolute inset-0 bg-teal-400/20 blur-3xl rounded-full scale-150 group-hover:bg-teal-400/40 transition-all duration-700" />
        
        <svg 
          viewBox="0 0 100 140" 
          className="w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] overflow-visible"
        >
          <g className="animate-body-sway origin-bottom">
            <g className="animate-head-nod origin-[50px_25px]">
              <circle cx="50" cy="20" r="11" fill={colors.bone} />
              <path d="M42 12 Q50 8 58 12" fill="none" stroke={colors.muscle} strokeWidth="2" opacity="0.4" />
            </g>

            <rect x="47" y="31" width="6" height="55" rx="3" fill={colors.bone} />
            <path d="M35 45 Q50 42 65 45" fill="none" stroke={colors.bone} strokeWidth="1.5" opacity="0.8" />
            <path d="M32 55 Q50 52 68 55" fill="none" stroke={colors.bone} strokeWidth="1.5" opacity="0.8" />
            <path d="M35 85 Q50 82 65 85 L58 95 Q50 98 42 95 Z" fill={colors.bone} />

            <g className="opacity-40 group-hover:opacity-100 transition-opacity duration-700">
              <path d="M38 42 Q50 48 62 42 L60 65 Q50 60 40 65 Z" fill={colors.muscle} className="animate-pulse-slow" />
              <rect x="44" y="66" width="12" height="15" rx="2" fill={colors.muscle} opacity="0.8" />
              <path d="M30 40 L45 80 M70 40 L55 80" stroke={colors.fascia} strokeWidth="0.5" fill="none" opacity="0.6" strokeDasharray="2,2" className="animate-dash" />
            </g>

            <g className="animate-arm-left origin-[35px_40px]">
              <rect x="24" y="38" width="10" height="25" rx="5" fill={colors.bone} />
              <rect x="26" y="63" width="7" height="22" rx="3.5" fill={colors.bone} />
              <ellipse cx="29" cy="50" rx="6" ry="10" fill={colors.muscle} opacity="0.6" />
            </g>

            <g className="animate-arm-right origin-[65px_40px]">
              <rect x="66" y="38" width="10" height="25" rx="5" fill={colors.bone} />
              <rect x="67" y="63" width="7" height="22" rx="3.5" fill={colors.bone} />
              <ellipse cx="71" cy="50" rx="6" ry="10" fill={colors.muscle} opacity="0.6" />
            </g>

            <g className="origin-[42px_90px]">
              <rect x="38" y="92" width="9" height="24" rx="4.5" fill={colors.bone} />
              <rect x="39" y="117" width="7" height="20" rx="3.5" fill={colors.bone} />
              <path d="M38 95 Q42 105 47 95 L45 115 Q42 118 40 115 Z" fill={colors.muscle} opacity="0.5" />
            </g>

            <g className="origin-[58px_90px]">
              <rect x="53" y="92" width="9" height="24" rx="4.5" fill={colors.bone} />
              <rect x="54" y="117" width="7" height="20" rx="3.5" fill={colors.bone} />
              <path d="M53 95 Q58 105 62 95 L60 115 Q58 118 55 115 Z" fill={colors.muscle} opacity="0.5" />
            </g>
          </g>

          <circle cx="50" cy="55" r="4" fill="#14b8a6" className="animate-ping" />
          <circle cx="50" cy="55" r="2" fill="#14b8a6" />
        </svg>

        <style>{`
          @keyframes pt-sway { 0%, 100% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } }
          @keyframes pt-nod { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(1px) rotate(2deg); } }
          @keyframes pt-wave { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-5deg); } }
          @keyframes pt-pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.02); } }
          @keyframes pt-dash { to { stroke-dashoffset: 20; } }
          .animate-body-sway { animation: pt-sway 6s ease-in-out infinite; }
          .animate-head-nod { animation: pt-nod 4s ease-in-out infinite; }
          .animate-arm-left { animation: pt-wave 5s ease-in-out infinite; }
          .animate-arm-right { animation: pt-wave 5s ease-in-out infinite reverse; }
          .animate-pulse-slow { animation: pt-pulse 3s ease-in-out infinite; transform-origin: center; }
          .animate-dash { animation: pt-dash 5s linear infinite; stroke-dasharray: 2,2; }
        `}</style>
      </button>
    </div>
  );
};

export default MSKCharacter;
