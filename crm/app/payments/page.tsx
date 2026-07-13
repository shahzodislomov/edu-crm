"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";

export default function PaymentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("");

  // Form Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [student, setStudent] = useState("");
  const [group, setGroup] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [status, setStatus] = useState("paid");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Relational options
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [groupsList, setGroupsList] = useState<any[]>([]);

  const fetchPayments = (userRole?: string) => {
    setLoading(true);
    const activeRole = userRole || role;
    if (activeRole === "admin") {
      api.get(ENDPOINTS.payments.list)
        .then((res) => {
          setItems(res.data.results || res.data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else if (activeRole === "student") {
      api.get("/payments/my/")
        .then((res) => {
          setItems(res.data.results || res.data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get(ENDPOINTS.auth.me)
      .then((res) => {
        const freshUser = res.data;
        setRole(freshUser.role);
        fetchPayments(freshUser.role);
      })
      .catch((err) => {
        console.error("Payments data fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Fetch relational data when modal opens
  useEffect(() => {
    if (isOpen && role === "admin") {
      api.get(ENDPOINTS.students.list).then((res) => {
        setStudentsList(res.data.results || res.data || []);
      }).catch(console.error);

      api.get(ENDPOINTS.groups.list).then((res) => {
        setGroupsList(res.data.results || res.data || []);
      }).catch(console.error);
    }
  }, [isOpen, role]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setStudent("");
    setGroup("");
    setAmount("");
    setPaymentDate("");
    setStatus("paid");
    setNote("");
    setError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (payment: any) => {
    setIsEditMode(true);
    setEditingId(payment.id);
    setStudent(String(payment.student?.id || payment.student || ""));
    setGroup(String(payment.group?.id || payment.group || ""));
    setAmount(String(payment.amount || ""));
    setPaymentDate(payment.payment_date || "");
    setStatus(payment.status || "paid");
    setNote(payment.note || "");
    setError("");
    setIsOpen(true);
  };

  const handleDelete = async (payment: any) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) {
      return;
    }
    try {
      await api.delete(`${ENDPOINTS.payments.list}${payment.id}/`);
      fetchPayments();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete payment record.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      student: parseInt(student),
      group: parseInt(group),
      amount: parseFloat(amount),
      payment_date: paymentDate,
      status,
      note: note || null,
    };

    try {
      if (isEditMode && editingId) {
        await api.put(`${ENDPOINTS.payments.list}${editingId}/`, payload);
      } else {
        await api.post(ENDPOINTS.payments.list, payload);
      }
      setIsOpen(false);
      fetchPayments();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save payment record. Check fields.");
    } finally {
      setSubmitting(false);
    }
  };

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

  // Map rows
  const rows = items.map((p) => ({
    id: p.id,
    student_name: p.student_name || p.student?.user?.username || "-",
    group_name: p.group_name || p.group?.name || "-",
    amount: p.amount,
    status: p.status || "pending",
    payment_date: p.payment_date || "-",
    // Store original entities for pre-population in edit handler
    student: p.student,
    group: p.group,
    note: p.note,
  }));

  const isAdmin = role === "admin";

  return (
    <DashboardLayout allowedRoles={["admin", "student"]}>
      <PageHeader
        title="Payments & Invoices"
        subtitle={
          role === "admin"
            ? "Track tuition payments, collected fees, and active accounts."
            : "Review your personal invoice history and tuition balances."
        }
      >
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer focus:outline-none"
          >
            + Register Payment
          </button>
        )}
      </PageHeader>
      <DataTable
        columns={columns}
        data={rows}
        onEdit={isAdmin ? handleOpenEdit : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      {/* Creation Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEditMode ? "Edit Payment Record" : "Register Student Payment"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Student
            </label>
            <select
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              required
            >
              <option value="" className="text-slate-800 dark:text-white bg-background">Select a student</option>
              {studentsList.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-800 dark:text-white bg-background">
                  {s.user?.first_name ? `${s.user.first_name} ${s.user.last_name}` : s.user?.username}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Study Group
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              >
                <option value="" className="text-slate-800 dark:text-white bg-background">Select a group</option>
                {groupsList.map((g) => (
                  <option key={g.id} value={g.id} className="text-slate-800 dark:text-white bg-background">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                placeholder="150"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              >
                <option value="paid" className="text-slate-800 dark:text-white bg-background">Paid</option>
                <option value="pending" className="text-slate-800 dark:text-white bg-background">Pending</option>
                <option value="overdue" className="text-slate-800 dark:text-white bg-background">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid in cash, bank transfer receipt..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Register Payment"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
