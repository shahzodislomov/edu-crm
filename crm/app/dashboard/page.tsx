"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardStats, User } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Role-specific stats
  const [roleStats, setRoleStats] = useState<{
    coursesCount: number;
    groupsCount: number;
    assignmentsCount: number;
    notificationsCount: number;
    groups: any[];
    assignments: any[];
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    // 1. Fetch user profile first
    api
      .get(ENDPOINTS.auth.me)
      .then((userRes) => {
        const currentUser = userRes.data;
        setUser(currentUser);
        localStorage.setItem("user_profile", JSON.stringify(currentUser));

        // 2. Fetch stats based on role
        if (currentUser.role === "admin") {
          api
            .get(ENDPOINTS.dashboard)
            .then((res) => {
              setStats(res.data);
            })
            .catch((err) => {
              console.error("Dashboard fetch error:", err);
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          // Teacher or Student: fetch allowed listings in parallel
          Promise.all([
            api.get(ENDPOINTS.courses.list).catch(() => ({ data: { results: [] } })),
            api.get(ENDPOINTS.groups.list).catch(() => ({ data: { results: [] } })),
            api.get(ENDPOINTS.assignments.list).catch(() => ({ data: { results: [] } })),
            api.get(ENDPOINTS.notifications.list).catch(() => ({ data: { results: [] } })),
          ])
            .then(([coursesRes, groupsRes, assignmentsRes, notificationsRes]) => {
              const courses = coursesRes.data.results || coursesRes.data || [];
              const groups = groupsRes.data.results || groupsRes.data || [];
              const assignments = assignmentsRes.data.results || assignmentsRes.data || [];
              const notifications = notificationsRes.data.results || notificationsRes.data || [];

              setRoleStats({
                coursesCount: courses.length,
                groupsCount: groups.length,
                assignmentsCount: assignments.length,
                notificationsCount: notifications.length,
                groups,
                assignments,
              });
            })
            .catch((err) => {
              console.error("Parallel list fetch error:", err);
            })
            .finally(() => {
              setLoading(false);
            });
        }
      })
      .catch((err) => {
        console.error("Me profile fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="Dashboard" subtitle="Overview" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="h-64 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card animate-pulse" />
          <div className="h-64 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  // Display Admin Dashboard
  if (user?.role === "admin" && stats) {
    const { overview, payments, attendance, assignments } = stats;

    return (
      <DashboardLayout>
        <PageHeader title="Admin Dashboard" subtitle="Welcome back! Here is a summary of the education center metrics." />

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={overview.total_students}
            trend={{ value: "12%", label: "From last month", isPositive: true }}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-3 8v-5h6v5" />
              </svg>
            }
          />
          <StatCard
            title="Total Teachers"
            value={overview.total_teachers}
            trend={{ value: "4%", label: "Newly hired", isPositive: true }}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                <circle cx="12" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          />
          <StatCard
            title="Total Groups"
            value={overview.total_groups}
            trend={{ value: stats.groups.active, label: "Active course groups", isPositive: true }}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Courses"
            value={overview.total_courses}
            trend={{ value: "Active", label: "Catalog curriculums", isPositive: true }}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>

        {/* Grid Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payments Analytics Panel */}
          <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Financial Analytics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly invoice collection and payments metrics</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Total Collected</span>
                    <span className="text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(payments.total_paid)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Pending Invoices</span>
                    <span className="text-amber-500">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(payments.total_pending)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "20%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Overdue Arrears</span>
                    <span className="text-red-500">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(payments.total_overdue)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: "10%" }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/20 dark:border-slate-800/30 rounded-2xl p-4">
                <div className="flex flex-col justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{payments.total_debtors}</span>
                  <span className="text-xxs font-semibold uppercase tracking-wider text-slate-400 mt-1">Active Debtors</span>
                </div>
                <div className="flex flex-col justify-center text-center border-l border-slate-200/50 dark:border-slate-800/50">
                  <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {Math.round((payments.total_paid / (payments.total_paid + payments.total_pending + 1)) * 100)}%
                  </span>
                  <span className="text-xxs font-semibold uppercase tracking-wider text-slate-400 mt-1">Collection Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Gauge Panel */}
          <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Attendance Rate</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Class presence analytics for current term</p>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="54" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    className="stroke-indigo-500"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - parseFloat(attendance.attendance_rate || "0") / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{attendance.attendance_rate}</span>
                  <span className="block text-xxs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Present</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-center text-xs font-semibold text-slate-500 border-t border-slate-200/30 dark:border-slate-800/30 pt-4">
              <div>
                <span className="block text-green-600 dark:text-green-400 font-bold">{attendance.present}</span>
                <span className="text-xxs text-slate-400 dark:text-slate-500">Present</span>
              </div>
              <div className="border-l border-slate-200/50 dark:border-slate-800/50 h-5" />
              <div>
                <span className="block text-amber-500 font-bold">{attendance.late}</span>
                <span className="text-xxs text-slate-400 dark:text-slate-500">Late</span>
              </div>
              <div className="border-l border-slate-200/50 dark:border-slate-800/50 h-5" />
              <div>
                <span className="block text-red-500 font-bold">{attendance.absent}</span>
                <span className="text-xxs text-slate-400 dark:text-slate-500">Absent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel (Academic Submissions) */}
        <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Academic Assignments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Submissions, grading rates, and curriculum statuses</p>
            </div>
            <div className="flex space-x-2 mt-3 sm:mt-0">
              <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-xs font-medium">
                Grade Rate: {Math.round((assignments.graded / (assignments.submissions + 1)) * 100)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
              <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">Active Curriculums</div>
              <div className="text-2xl font-black text-slate-800 dark:text-white">{assignments.total}</div>
              <p className="text-xxs text-slate-500 dark:text-slate-400 mt-1">Pending and currently assigned tests</p>
            </div>

            <div className="p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
              <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">Submissions Received</div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{assignments.submissions}</div>
              <p className="text-xxs text-slate-500 dark:text-slate-400 mt-1">Uploads received from active students</p>
            </div>

            <div className="p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
              <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">Graded Tasks</div>
              <div className="text-2xl font-black text-green-600 dark:text-green-400">{assignments.graded}</div>
              <p className="text-xxs text-slate-500 dark:text-slate-400 mt-1">Completed reviews by teachers</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Display Role-Specific (Teacher / Student) Dashboard
  if (roleStats) {
    const { coursesCount, groupsCount, assignmentsCount, groups, assignments } = roleStats;
    const isTeacher = user?.role === "teacher";

    // Clean tables column formats
    const groupColumns = [
      { key: "id", label: "Group ID" },
      { key: "name", label: "Group Name" },
      { key: "status", label: "Status" },
    ];

    const assignmentColumns = [
      { key: "id", label: "ID" },
      { key: "title", label: "Assignment Title" },
      { key: "due_date", label: "Due Date" },
    ];

    return (
      <DashboardLayout>
        <PageHeader
          title={isTeacher ? "Teacher Dashboard" : "Student Portal"}
          subtitle={`Welcome back, ${user?.full_name || user?.username}! Here is an overview of your active academic roster.`}
        />

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title={isTeacher ? "My Teaching Groups" : "Enrolled Classes"}
            value={groupsCount}
            trend={{ value: "Active", label: "Current term groups", isPositive: true }}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Available Courses"
            value={coursesCount}
            trend={{ value: "Catalog", label: "Curriculums online", isPositive: true }}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatCard
            title={isTeacher ? "Assigned Tasks" : "Pending Assignments"}
            value={assignmentsCount}
            trend={{ value: "Pending", label: "Awaiting submission", isPositive: false }}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />
        </div>

        {/* Dynamic Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          {/* Active Groups List */}
          <div className="space-y-3">
            <div className="px-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {isTeacher ? "My Class Groups" : "Enrolled Class Groups"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Class schedules and status records</p>
            </div>
            <DataTable columns={groupColumns} data={groups.slice(0, 5)} />
          </div>

          {/* Pending Assignments List */}
          <div className="space-y-3">
            <div className="px-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {isTeacher ? "Assigned Class Homework" : "Awaiting Tasks"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deadlines and pending course task titles</p>
            </div>
            <DataTable columns={assignmentColumns} data={assignments.slice(0, 5)} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback / Connection Error view
  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle="Overview" />
      <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card text-slate-500">
        <svg className="w-12 h-12 mb-3 stroke-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-sm font-semibold">Failed to load user portal layout.</span>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg cursor-pointer hover:opacity-90"
        >
          Reload Interface
        </button>
      </div>
    </DashboardLayout>
  );
}
