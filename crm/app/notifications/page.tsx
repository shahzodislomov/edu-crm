"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api
      .get(ENDPOINTS.notifications.list)
      .then((res) => setItems(res.data.results))
      .catch((err) => console.error(err));
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (_) {}
    return dateStr;
  };

  return (
    <DashboardLayout>
      <PageHeader title="Notifications" subtitle="Stay updated with school events, system notifications, and announcements." />
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card text-slate-400 dark:text-slate-500">
          <svg className="w-12 h-12 mb-3 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-sm font-medium">No new notifications</span>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((n) => (
            <div
              key={n.id}
              className="flex items-start space-x-4 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card shadow-xs hover:shadow-md transition-all duration-200 group"
            >
              {/* Notification Icon Badge */}
              <div className="w-10 h-10 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                  {n.title || "Notification Update"}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {n.message || "You have received an educational update."}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 pt-1 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(n.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
