"use client";

import React from "react";

export interface Column {
  key: string;
  label: string;
}

export default function DataTable<T>({
  columns,
  data,
}: {
  columns: Column[];
  data: T[];
}) {
  const renderCellContent = (key: string, value: any) => {
    const strVal = String(value ?? "");
    const lowerKey = key.toLowerCase();
    
    // Handle status badges
    if (lowerKey === "status" || lowerKey === "state" || lowerKey === "payment_status") {
      const lower = strVal.toLowerCase();
      let colorClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      
      if (lower === "active" || lower === "paid" || lower === "present") {
        colorClass = "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400";
      } else if (lower === "pending" || lower === "late") {
        colorClass = "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
      } else if (lower === "overdue" || lower === "finished" || lower === "absent" || lower === "debt") {
        colorClass = "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      }
      
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colorClass}`}>
          {strVal}
        </span>
      );
    }
    
    // Formatting currency
    if (lowerKey === "amount" || lowerKey === "salary" || lowerKey === "price") {
      const num = Number(value);
      if (!isNaN(num)) {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
      }
    }
    
    // Formatting date values
    if (lowerKey === "enrolled_at" || lowerKey === "due_date" || lowerKey === "payment_date" || lowerKey === "created_at" || lowerKey === "start_date" || lowerKey === "end_date") {
      if (strVal && strVal !== "-") {
        try {
          const date = new Date(strVal);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
          }
        } catch (_) {}
      }
    }
    
    return strVal;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card text-slate-400 dark:text-slate-500">
        <svg className="w-12 h-12 mb-3 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-sm font-medium">No records found</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/50 dark:divide-slate-800/50">
          <thead className="bg-slate-50/50 dark:bg-slate-900/30">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase select-none"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
            {data.map((row: any, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap"
                  >
                    {renderCellContent(c.key, row[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
