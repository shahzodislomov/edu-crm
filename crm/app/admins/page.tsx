"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchAdmins = () => {
    setLoading(true);
    api
      .get("/auth/users/")
      .then((res) => {
        // Filter users that are admins
        const allUsers = res.data.results || res.data || [];
        const adminUsers = allUsers.filter((u: any) => u.role === "admin");
        setAdmins(adminUsers);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (admin: any) => {
    setIsEditMode(true);
    setEditingId(admin.id);
    setUsername(admin.username || "");
    setEmail(admin.email || "");
    setPassword(""); // Leave blank unless changing
    setFirstName(admin.first_name || "");
    setLastName(admin.last_name || "");
    setPhone(admin.phone || "");
    setError("");
    setIsOpen(true);
  };

  const handleDelete = async (admin: any) => {
    if (!window.confirm(`Are you sure you want to remove administrator "${admin.username}"?`)) {
      return;
    }
    try {
      await api.delete(`/auth/users/${admin.id}/`);
      fetchAdmins();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete administrator.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload: any = {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || undefined,
      role: "admin",
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (isEditMode && editingId) {
        await api.put(`/auth/users/${editingId}/`, payload);
      } else {
        if (!password) {
          setError("Password is required for new administrators.");
          setSubmitting(false);
          return;
        }
        await api.post("/auth/users/", payload);
      }
      setIsOpen(false);
      fetchAdmins();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save administrator profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
  ];

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader title="Administrators" subtitle="Manage core system administrators and access clearance.">
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer focus:outline-none"
        >
          + Add Admin
        </button>
      </PageHeader>

      {loading ? (
        <div className="h-64 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 animate-pulse flex items-center justify-center text-slate-400" />
      ) : (
        <DataTable columns={columns} data={admins} onEdit={handleOpenEdit} onDelete={handleDelete} />
      )}

      {/* Creation/Edit Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEditMode ? "Edit Administrator" : "Add New Administrator"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="admin_user"
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
                placeholder="Temur"
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
                placeholder="Aliev"
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
              placeholder="admin@educrm.uz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              required
            />
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
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Admin"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
