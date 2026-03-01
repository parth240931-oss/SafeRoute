
import React from 'react';

export const COLORS = {
  primary: '#6366f1', // Indigo 500
  sheNav: '#a855f7', // Purple 500
  heNav: '#0ea5e9', // Sky 500
  success: '#22c55e', // Green 500
  warning: '#f59e0b', // Amber 500
  danger: '#ef4444', // Red 500
};

export const GENDER_THEMES = {
  woman: {
    label: 'She Nav',
    color: 'purple',
    accent: COLORS.sheNav,
    bgClass: 'bg-purple-600',
    textClass: 'text-purple-600',
    borderClass: 'border-purple-200',
    gradient: 'from-purple-500 to-indigo-700'
  },
  man: {
    label: 'He Nav',
    color: 'sky',
    accent: COLORS.heNav,
    bgClass: 'bg-sky-600',
    textClass: 'text-sky-600',
    borderClass: 'border-sky-200',
    gradient: 'from-sky-500 to-indigo-700'
  },
  other: {
    label: 'Guardian Nav',
    color: 'indigo',
    accent: COLORS.primary,
    bgClass: 'bg-indigo-600',
    textClass: 'text-indigo-600',
    borderClass: 'border-indigo-200',
    gradient: 'from-indigo-500 to-slate-700'
  }
};

export const Icons = {
  Walking: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Car: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Bus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Metro: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1zM13 16l4 2 4-2M17 18v3" />
    </svg>
  ),
  Safety: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Wheelchair: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
};
