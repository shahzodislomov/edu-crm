"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [salary, setSalary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchTeachers = () => {
    setLoading(true);
    api
      .get(ENDPOINTS.teachers.list)
      .then((res) => {
        setTeachers(res.data.results || res.data || []);
      })
      .catch((err) => {
        console.error("Teachers list loading error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setEditingUserId(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setSubject("");
    setSalary("");
    setError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (teacher: any) => {
    setIsEditMode(true);
    setEditingId(teacher.id);
    setEditingUserId(teacher.user?.id || null);
    setUsername(teacher.user?.username || "");
    setEmail(teacher.user?.email || "");
    setPassword(""); // Keep blank unless resetting
    setFirstName(teacher.user?.first_name || "");
    setLastName(teacher.user?.last_name || "");
    setPhone(teacher.user?.phone || "");
    setSubject(teacher.subject || "");
    setSalary(String(teacher.salary || ""));
    setError("");
    setIsOpen(true);
  };

  const handleDelete = async (teacher: any) => {
    if (!teacher.user?.id) return;
    if (!window.confirm(`Are you sure you want to remove teacher "${teacher.user.username}"?`)) {
      return;
    }

    try {
      // Deleting the core user will cascade and delete the teacher profile
      await api.delete(`/auth/users/${teacher.user.id}/`);
      fetchTeachers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete teacher.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isEditMode && editingId && editingUserId) {
        // 1. Update Core User Details
        const userPayload: any = {
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || undefined,
          role: "teacher",
        };
        if (password) {
          userPayload.password = password;
        }
        await api.put(`/auth/users/${editingUserId}/`, userPayload);

        // 2. Update Teacher Profile details
        await api.patch(`${ENDPOINTS.teachers.list}${editingId}/`, {
          subject: subject || undefined,
          salary: salary ? parseFloat(salary) : undefined,
        });
      } else {
        if (!password) {
          setError("Password is required for new teacher accounts.");
          setSubmitting(false);
          return;
        }
        // Create teacher via POST
        await api.post(ENDPOINTS.teachers.list, {
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone: phone || undefined,
          subject: subject || undefined,
          salary: salary ? parseFloat(salary) : undefined,
        });
      }

      setIsOpen(false);
      fetchTeachers();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save teacher details. Check fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "user", label: "Username" },
    { key: "subject", label: "Subject" },
    { key: "salary", label: "Salary" },
  ];

  const rows = teachers.map((t) => ({
    id: t.id,
    user: t.user?.username || "-",
    subject: t.subject || "-",
    salary: t.salary || 0,
    // Store user details nested in row for edit handler convenience
    userObj: t.user,
  }));

  // Re-map rows to include original object
  const dataForTable = teachers.map((t) => ({
    ...t,
    user: t.user?.username || "-",
  }));

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader title="Teachers" subtitle="Manage academic staff rosters and subject specializations.">
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer focus:outline-none"
        >
          + Add Teacher
        </button>
      </PageHeader>

      {loading ? (
        <div className="h-64 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 animate-pulse" />
      ) : (
        <DataTable
          columns={columns}
          data={dataForTable}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Creation Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEditMode ? "Edit Teacher Profile" : "Add New Teacher"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="teacher_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password {isEditMode && "(Optional)"}
              </label>
              <input
                type="password"
                placeholder={isEditMode ? "Leave blank to keep same" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required={!isEditMode}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                First Name
              </label>
              <input
                type="text"
                placeholder="Sardor"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Ismoilov"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="teacher@educrm.uz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Salary (USD)
              </label>
              <input
                type="number"
                placeholder="1200"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Teacher"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
