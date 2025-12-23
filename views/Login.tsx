
import React, { useState } from 'react';
import { useApp } from '../App';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const { setCurrentUser, language, setLanguage, darkMode, setDarkMode, t, physios, patients } = useApp();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Register
  const [error, setError] = useState<string | null>(null);

  // Feedback State
  const [feedbackType, setFeedbackType] = useState<'ISSUE' | 'SUGGESTION' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setIsLoggingIn(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const emailLower = email.toLowerCase();
    const existingPatient = patients.find(p => p.email.toLowerCase() === emailLower);
    const existingPhysio = physios.find(p => p.email.toLowerCase() === emailLower);

    if (isSignUp) {
      if (existingPatient || existingPhysio) {
        setError(language === 'ar' 
          ? 'هذا البريد مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.' 
          : 'This email is already registered. Please sign in instead.');
        setIsLoggingIn(false);
        return;
      }

      setCurrentUser({
        id: `${role === UserRole.PHYSIO ? 'physio' : 'patient'}-${Date.now()}`,
        email: emailLower,
        name: email.split('@')[0].toUpperCase(),
        role: role
      });
    } else {
      if (role === UserRole.PHYSIO) {
        if (existingPhysio) {
          setCurrentUser(existingPhysio);
        } else {
          setError(language === 'ar' 
            ? 'عذراً، هذا البريد غير مسجل كمعالج.' 
            : 'Therapist account not found.');
        }
      } else {
        if (existingPatient) {
          setCurrentUser({
            id: existingPatient.id,
            email: existingPatient.email,
            name: existingPatient.name,
            role: UserRole.PATIENT
          });
        } else {
          setError(language === 'ar' 
            ? 'الحساب غير موجود. يرجى التسجيل أولاً.' 
            : 'Account not found. Please register first.');
        }
      }
    }
    setIsLoggingIn(false);
  };

  const handleSendFeedback = async () => {
    if (!feedbackText) return;
    setIsSendingFeedback(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsSendingFeedback(false);
    setFeedbackSuccess(true);
    setFeedbackText('');
    setTimeout(() => {
      setFeedbackSuccess(false);
      setFeedbackType(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      <div className="mb-8 flex items-center gap-4">
        {/* Language Toggle */}
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => { setLanguage('en'); setError(null); }}
            className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 ${language === 'en' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            English
          </button>
          <button 
            onClick={() => { setLanguage('ar'); setError(null); }}
            className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 ${language === 'ar' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            العربية
          </button>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-slate-500 hover:text-teal-600 transition-all duration-300 hover:rotate-12"
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl dark:shadow-none p-10 border border-slate-100 dark:border-slate-800 transition-all duration-500 mb-8">
        <div className="text-center mb-10 overflow-hidden">
          <div key={`${role}-${language}-${isSignUp}`} className="animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-700 fill-mode-both">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transition-transform hover:scale-110 duration-300">
              <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {isSignUp ? (language === 'ar' ? 'إنشاء حساب' : 'Create Account') : t('welcome')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg font-medium">
              {isSignUp 
                ? (language === 'ar' ? 'انضم إلى عائلة فيزيو تراك' : 'Join the PhysioTrack family')
                : (role === UserRole.PHYSIO ? `Pro ${t('therapist')}` : t('signInHealth'))}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">{t('accountType')}</label>
            <div className="grid grid-cols-2 gap-4 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isLoggingIn}
                onClick={() => { setRole(UserRole.PATIENT); setError(null); }}
                className={`py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${role === UserRole.PATIENT ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-md ring-1 ring-black/5' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {t('patient')}
              </button>
              <button
                type="button"
                disabled={isLoggingIn}
                onClick={() => { setRole(UserRole.PHYSIO); setError(null); }}
                className={`py-3.5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${role === UserRole.PHYSIO ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-md ring-1 ring-black/5' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {t('therapist')}
              </button>
            </div>
          </div>

          <div key={role} className="animate-in fade-in slide-in-from-left-4 duration-500">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">{t('emailLabel')}</label>
            <input 
              type="email" 
              required
              disabled={isLoggingIn}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-left font-medium"
              placeholder={role === UserRole.PHYSIO ? "e.g. sarah@physio.com" : "e.g. name@health.com"}
              dir="ltr"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoggingIn}
            className={`group relative w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-teal-200 dark:shadow-none overflow-hidden flex items-center justify-center gap-3 ${isLoggingIn ? 'opacity-70 scale-95' : 'hover:translate-y-[-2px] active:scale-95'}`}
          >
            {isLoggingIn && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span className="relative z-10 text-lg uppercase tracking-wider">
              {isSignUp ? t('registerNow') : t('signIn')}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-10 font-medium">
          {isSignUp ? (
            <>
              {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'} {' '}
              <button onClick={() => setIsSignUp(false)} className="text-teal-600 dark:text-teal-400 font-bold hover:underline transition-all">{t('signIn')}</button>
            </>
          ) : (
            <>
              {t('noAccount')} {' '}
              <button onClick={() => setIsSignUp(true)} className="text-teal-600 dark:text-teal-400 font-bold hover:underline transition-all">{t('registerNow')}</button>
            </>
          )}
        </p>
      </div>

      {/* NEW: Report Issue and Suggestion Section */}
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
             </div>
             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('communitySupport')}</h3>
          </div>

          <div className="space-y-4">
             {/* Interaction Toggle */}
             {!feedbackType ? (
               <div className="flex gap-3">
                 <button 
                    onClick={() => setFeedbackType('ISSUE')}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-red-400 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                 >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('reportIssue')}
                 </button>
                 <button 
                    onClick={() => setFeedbackType('SUGGESTION')}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-all flex items-center justify-center gap-2"
                 >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    {t('addSuggestion')}
                 </button>
               </div>
             ) : (
               <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center px-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${feedbackType === 'ISSUE' ? 'text-red-500' : 'text-teal-500'}`}>
                      {feedbackType === 'ISSUE' ? t('reportIssue') : t('addSuggestion')}
                    </span>
                    <button onClick={() => setFeedbackType(null)} className="text-slate-400 hover:text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  {feedbackSuccess ? (
                    <div className="p-8 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 flex flex-col items-center animate-in zoom-in duration-500">
                       <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       <p className="text-green-600 dark:text-green-400 font-bold text-sm">{t('feedbackSent')}</p>
                    </div>
                  ) : (
                    <>
                      <textarea 
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder={feedbackType === 'ISSUE' ? t('reportPlaceholder') : t('suggestionPlaceholder')}
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-teal-500 h-24 transition-all"
                      />
                      <button 
                        disabled={!feedbackText || isSendingFeedback}
                        onClick={handleSendFeedback}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${feedbackType === 'ISSUE' ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'} disabled:opacity-50`}
                      >
                        {isSendingFeedback && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {t('submitReport')}
                      </button>
                    </>
                  )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
