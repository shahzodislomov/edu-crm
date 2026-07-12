"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    // Optimistically skip query if cache confirms user is not admin
    const cached = typeof window !== "undefined" ? localStorage.getItem("user_profile") : null;
    if (cached) {
      try {
        const u = JSON.parse(cached);
        if (u.role !== "admin") return;
      } catch (_) {}
    }

    api
      .get(ENDPOINTS.students.list)
      .then((res) => {
        setStudents(res.data.results || []);
      })
      .catch(console.error);
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "user", label: "Username" },
    { key: "enrolled_at", label: "Enrolled" },
  ];

  const rows = students.map((s) => ({
    id: s.id,
    user: s.user?.username || "-",
    enrolled_at: s.enrolled_at || "-",
  }));

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader title="Students" subtitle="Manage registered student profiles and enrollment records." />
      <DataTable columns={columns} data={rows} />
    </DashboardLayout>
  );
}
