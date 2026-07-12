import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    label?: string;
    isPositive?: boolean;
  };
  description?: string;
  progress?: number;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  progress,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</span>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors duration-200">
          {value}
        </span>
        {trend && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            trend.isPositive !== false
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}>
            {trend.isPositive !== false ? "+" : ""}
            {trend.value}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-linear-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

      {(description || (trend && trend.label)) && (
        <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          {description || trend?.label}
        </p>
      )}
    </div>
  );
}
