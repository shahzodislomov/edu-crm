"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);

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
      .get(ENDPOINTS.teachers.list)
      .then((res) => {
        setTeachers(res.data.results || []);
      })
      .catch(console.error);
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "user", label: "Username" },
    { key: "enrolled_at", label: "Enrolled" },
  ];

  const rows = teachers.map((t) => ({
    id: t.id,
    user: t.user?.username || "-",
    enrolled_at: t.enrolled_at || "-",
  }));

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader title="Teachers" subtitle="Manage academic staff rosters and subject specializations." />
      <DataTable columns={columns} data={rows} />
    </DashboardLayout>
  );
}
