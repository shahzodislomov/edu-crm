"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PaymentForm from "@/components/forms/PaymentForm";


export default function PaymentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    // 1. Check cached role for instant routing determination
    const cached = typeof window !== "undefined" ? localStorage.getItem("user_profile") : null;
    let cachedRole = "";
    if (cached) {
      try {
        const u = JSON.parse(cached);
        cachedRole = u.role;
        setRole(cachedRole);
      } catch (_) {}
    }

    if (cachedRole === "teacher") {
      setLoading(false);
      return;
    }

    // 2. Fetch fresh user role and load correct listings
    api
      .get(ENDPOINTS.auth.me)
      .then((res) => {
        const freshUser = res.data;
        setRole(freshUser.role);
        localStorage.setItem("user_profile", JSON.stringify(freshUser));

        if (freshUser.role === "admin") {
          return api.get(ENDPOINTS.payments.list);
        } else if (freshUser.role === "student") {
          return api.get("/payments/my/");
        }
        return null;
      })
      .then((paymentsRes) => {
        if (paymentsRes) {
          const results = paymentsRes.data.results || paymentsRes.data || [];
          setItems(results);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Payments data fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin", "student"]}>
        <PageHeader title="Payments" subtitle="..." />
        <div className="h-64 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 animate-pulse" />
      </DashboardLayout>
    );
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "student_name", label: "Student" },
    { key: "group_name", label: "Group" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "payment_date", label: "Date" },
  ];

  const rows = items.map((p) => ({
    id: p.id,
    student_name: p.student_name || p.student?.user?.username || "-",
    group_name: p.group_name || p.group?.name || "-",
    amount: p.amount,
    status: p.status || "pending",
    payment_date: p.payment_date || "-",
  }));

  return (
    <DashboardLayout allowedRoles={["admin", "student"]}>
      <PageHeader
        title="Payments & Invoices"
        subtitle={
          role === "admin"
            ? "Track tuition payments, collected fees, and active accounts."
            : "Review your personal invoice history and tuition balances."
        }
      />
      {role === "admin" && (
        <div className="mb-6">
          <PaymentForm
            onCreated={(p: any) => setItems((prev) => [p, ...(prev || [])])}
          />
        </div>
      )}
      <DataTable columns={columns} data={rows} />
    </DashboardLayout>
  );
}
