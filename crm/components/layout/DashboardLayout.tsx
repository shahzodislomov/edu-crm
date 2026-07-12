"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import AccessDenied from "@/components/ui/AccessDenied";
import type { User } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "teacher" | "student")[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. Optimistic load of user profile for instant shell rendering
    const cached = typeof window !== "undefined" ? localStorage.getItem("user_profile") : null;
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch (_) {}
    }

    // 2. Perform authoritative token check via backend API
    api
      .get(ENDPOINTS.auth.me)
      .then((res) => {
        const freshUser = res.data;
        setUser(freshUser);
        localStorage.setItem("user_profile", JSON.stringify(freshUser));
        
        // 3. Gate access using verified backend profile details
        if (!allowedRoles || allowedRoles.includes(freshUser.role)) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auth me check failed:", err);
        setAuthorized(false);
        setLoading(false);
        
        // 4. Redirect on unauthorized token
        if (err.response?.status === 401) {
          localStorage.removeItem("user_profile");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      });
  }, [allowedRoles]);

  // Show visual skeleton shell while fetching authoritative backend credentials
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
        <Topbar user={null} />
        <div className="flex flex-1 relative min-h-[calc(100vh-64px)]">
          <Sidebar user={null} />
          <main className="flex-1 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/10 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased transition-colors duration-200">
      <Topbar user={user} />
      <div className="flex flex-1 relative min-h-[calc(100vh-64px)]">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/10 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* 5. Render children only if explicitly authorized by API response, else AccessDenied */}
            {!loading && !authorized ? <AccessDenied /> : children}
          </div>
        </main>
      </div>
    </div>
  );
}
