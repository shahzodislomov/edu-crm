"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

export default function PaymentForm({ onCreated }: { onCreated?: (p: any) => void }) {
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [student, setStudent] = useState<number | "">("");
  const [group, setGroup] = useState<number | "">("");
  const [amount, setAmount] = useState<number | string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [status, setStatus] = useState<string>("paid");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .get(ENDPOINTS.students.list)
      .then((res) => setStudents(res.data.results || res.data || []))
      .catch(() => setStudents([]));

    api
      .get(ENDPOINTS.groups.list)
      .then((res) => setGroups(res.data.results || res.data || []))
      .catch(() => setGroups([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!student || !group || !amount || !paymentDate) {
      setError("Please fill required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        student,
        group,
        amount: typeof amount === "string" ? Number(amount) : amount,
        payment_date: paymentDate,
        status,
        note,
      };

      const { data } = await api.post(ENDPOINTS.payments.list, payload);
      setSuccess("Payment created.");
      // reset minimal fields
      setAmount("");
      setPaymentDate("");
      setNote("");
      if (onCreated) onCreated(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || "Create failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-card border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Student</label>
          <select value={student} onChange={(e) => setStudent(Number(e.target.value) || "")} className="w-full rounded-xl border px-3 py-2 text-sm">
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.user?.username || s.id}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Group</label>
          <select value={group} onChange={(e) => setGroup(Number(e.target.value) || "") } className="w-full rounded-xl border px-3 py-2 text-sm">
            <option value="">Select group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="500000" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm">
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Note</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Optional note" />
        </div>
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}
      {success && <div className="text-xs text-green-500">{success}</div>}

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {loading ? "Creating..." : "Create Payment"}
        </button>
      </div>
    </form>
  );
}
