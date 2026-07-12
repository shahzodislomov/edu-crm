"use client";

import ThemeToggle from "./ThemeToggle";
import type { User } from "@/types";

export default function Topbar({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-16 px-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-background/85 backdrop-blur-md transition-colors duration-200 select-none">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="text-xl font-bold tracking-tight bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-white">
          EduCRM
        </div>
      </div>

      {/* Global Search Placeholder (visual-only for UI premium feel) */}
      <div className="hidden sm:flex items-center max-w-md w-full px-3 py-1.5 bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/20 dark:border-slate-800/30 rounded-xl text-slate-400">
        <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm">Search records, courses, reports...</span>
      </div>

      {/* Quick Actions Panel */}
      <div className="flex items-center space-x-3">
        {/* Dynamic User Role Badge */}
        {user && (
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>{user.role} Portal</span>
          </div>
        )}

        {/* Notifications Icon Button */}
        <button className="flex items-center justify-center w-9 h-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer relative">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </button>

        {/* Theme Switcher */}
        <ThemeToggle />
      </div>
    </header>
  );
}
