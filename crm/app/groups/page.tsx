"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    api
      .get(ENDPOINTS.groups.list)
      .then((res) => setGroups(res.data.results))
      .catch((err) => console.error(err));
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Groups" subtitle="Monitor active classes, student divisions, and study schedules." />
      <DataTable columns={columns} data={groups} />
    </DashboardLayout>
  );
}
