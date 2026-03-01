
import React from 'react';
import { GENDER_THEMES } from '../constants';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userProfile: UserProfile;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, userProfile }) => {
  const theme = GENDER_THEMES[userProfile.gender === 'man' ? 'man' : userProfile.gender === 'woman' ? 'woman' : 'other'];
  const showSafetyLabel = userProfile.sheNavEnabled;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden max-w-md mx-auto shadow-2xl relative">
      <header className={`p-4 flex justify-between items-center bg-white border-b sticky top-0 z-10 ${showSafetyLabel ? theme.borderClass : ''}`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${showSafetyLabel ? theme.bgClass + ' text-white' : 'bg-indigo-600 text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className={`font-bold text-lg ${showSafetyLabel ? theme.textClass.replace('text-', 'text-slate-900') : 'text-slate-800'}`}>
            SafeRoute {showSafetyLabel && <span className={`text-xs font-medium ${theme.bgClass.replace('bg-', 'bg-opacity-10 bg-')} ${theme.textClass} px-2 py-0.5 rounded-full ml-1`}>{theme.label}</span>}
          </h1>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        {children}
      </main>

      <nav className="bg-white border-t flex justify-around p-3 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-10">
        <NavButton 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => onTabChange('home')}
          icon={(active) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )} 
        />
        <NavButton 
          label="Insights" 
          active={activeTab === 'insights'} 
          onClick={() => onTabChange('insights')}
          icon={(active) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )} 
        />
        <NavButton 
          label={theme.label} 
          active={activeTab === 'shenav'} 
          onClick={() => onTabChange('shenav')}
          icon={(active) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? theme.textClass : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )} 
        />
        <NavButton 
          label="Profile" 
          active={activeTab === 'profile'} 
          onClick={() => onTabChange('profile')}
          icon={(active) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          )} 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ label: string; active: boolean; onClick: () => void; icon: (active: boolean) => React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 w-20">
    {icon(active)}
    <span className={`text-[10px] font-medium truncate ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
  </button>
);

export default Layout;
