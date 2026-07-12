"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle('theme-dark', stored === 'dark');
      document.documentElement.classList.toggle('theme-light', stored === 'light');
      document.documentElement.classList.toggle('dark', stored === 'dark');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      document.documentElement.classList.toggle('theme-dark', initial === 'dark');
      document.documentElement.classList.toggle('theme-light', initial === 'light');
      document.documentElement.classList.toggle('dark', initial === 'dark');
    }
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('theme-dark', next === 'dark');
    document.documentElement.classList.toggle('theme-light', next === 'light');
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  if (!theme) {
    return <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 animate-pulse ml-4" />;
  }

  return (
    <button
      onClick={toggle}
      className="ml-4 flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer hover:rotate-12"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
