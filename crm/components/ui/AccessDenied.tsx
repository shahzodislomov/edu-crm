import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card text-center max-w-md mx-auto mt-12 shadow-xs animate-fade-in select-none">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-5 shadow-inner">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Access Restricted</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        Your current account role does not have permission to access this management console. Please verify your credentials or contact administration.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 cursor-pointer"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
