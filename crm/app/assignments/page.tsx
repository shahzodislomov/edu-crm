"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AssignmentsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api
      .get(ENDPOINTS.assignments.list)
      .then((res) => setItems(res.data.results))
      .catch((err) => console.error(err));
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    { key: "due_date", label: "Due Date" },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Assignments" subtitle="Track homework, coursework assignments, and test schedules." />
      <DataTable columns={columns} data={items} />
    </DashboardLayout>
  );
}
