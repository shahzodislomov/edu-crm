"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { Course } from "@/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(ENDPOINTS.courses.list)
      .then((res) => {
        setCourses(res.data.results || res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch courses:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Course Name" },
    { key: "description", label: "Description" },
    { key: "duration_months", label: "Duration (Months)" },
    { key: "price", label: "Price" },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Courses" subtitle="View and manage education curriculum offerings and course lists." />
      {loading ? (
        <div className="h-64 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 animate-pulse flex items-center justify-center text-slate-400">
          Loading courses...
        </div>
      ) : (
        <DataTable columns={columns} data={courses} />
      )}
    </DashboardLayout>
  );
}
