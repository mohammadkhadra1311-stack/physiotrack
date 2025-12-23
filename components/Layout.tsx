
import React, { useState } from 'react';
import { useApp } from '../App';
import { ICONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string; icon: keyof typeof ICONS }[];
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, tabs }) => {
  const { currentUser, logout, language, darkMode, setDarkMode, t, isMSKEnabled, setIsMSKEnabled } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-teal-600">PhysioTrack</h1>
        <div className="flex items-center gap-2">
           <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500">
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 dark:text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
        md:translate-x-0 transition-transform duration-300
        fixed md:static inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50
        w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-teal-600 hidden md:block">PhysioTrack</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {tabs.map((tab) => {
            const Icon = ICONS[tab.icon];
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${activeTab === tab.id 
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* MSK Companion Toggle */}
          <button 
            onClick={() => setIsMSKEnabled(!isMSKEnabled)}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${isMSKEnabled ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <ICONS.Msk />
            {t('mskCompanion')}
          </button>

          {/* Theme Switcher */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all"
          >
            {darkMode ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                {t('lightMode')}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                {t('darkMode')}
              </>
            )}
          </button>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate text-start">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate text-start">{currentUser?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <ICONS.Logout />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 transition-colors duration-200">
        <div className="max-w-6xl mx-auto relative h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
