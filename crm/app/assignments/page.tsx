"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";

export default function AssignmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("");
  const [teacher, setTeacher] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Relational options
  const [groupsList, setGroupsList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);

  const fetchAssignments = () => {
    setLoading(true);
    api
      .get(ENDPOINTS.assignments.list)
      .then((res) => setItems(res.data.results || res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssignments();
    api.get(ENDPOINTS.auth.me)
      .then((res) => {
        setUserRole(res.data.role);
      })
      .catch(console.error);
  }, []);

  // Fetch relational data when modal opens
  useEffect(() => {
    const isAllowed = userRole === "admin" || userRole === "teacher";
    if (isOpen && isAllowed) {
      api.get(ENDPOINTS.groups.list).then((res) => {
        setGroupsList(res.data.results || res.data || []);
      }).catch(console.error);

      api.get(ENDPOINTS.teachers.list).then((res) => {
        setTeachersList(res.data.results || res.data || []);
      }).catch(console.error);
    }
  }, [isOpen, userRole]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setGroup("");
    setTeacher("");
    setDueDate("");
    setError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (assignment: any) => {
    setIsEditMode(true);
    setEditingId(assignment.id);
    setTitle(assignment.title || "");
    setDescription(assignment.description || "");
    setGroup(String(assignment.group?.id || assignment.group || ""));
    setTeacher(String(assignment.teacher?.id || assignment.teacher || ""));
    
    // Format date field safely
    let formattedDate = "";
    if (assignment.due_date) {
      formattedDate = assignment.due_date.split("T")[0];
    }
    setDueDate(formattedDate);
    
    setError("");
    setIsOpen(true);
  };

  const handleDelete = async (assignment: any) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${assignment.title}"?`)) {
      return;
    }
    try {
      await api.delete(`${ENDPOINTS.assignments.list}${assignment.id}/`);
      fetchAssignments();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete assignment.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      group: parseInt(group),
      teacher: parseInt(teacher),
      title,
      description: description || null,
      due_date: dueDate,
    };

    try {
      if (isEditMode && editingId) {
        await api.put(`${ENDPOINTS.assignments.list}${editingId}/`, payload);
      } else {
        await api.post(ENDPOINTS.assignments.list, payload);
      }
      setIsOpen(false);
      fetchAssignments();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save assignment. Check fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "group_name", label: "Group" },
    { key: "teacher_name", label: "Teacher" },
    { key: "title", label: "Title" },
    { key: "due_date", label: "Due Date" },
  ];

  const rows = items.map((a) => ({
    id: a.id,
    group_name: a.group_name || a.group?.name || "-",
    teacher_name: a.teacher_name || (a.teacher?.user?.first_name ? `${a.teacher.user.first_name} ${a.teacher.user.last_name}` : a.teacher?.user?.username) || "-",
    title: a.title,
    due_date: a.due_date,
    // Store original details for edit mode pre-population
    group: a.group,
    teacher: a.teacher,
    description: a.description,
  }));

  const isStaff = userRole === "admin" || userRole === "teacher";

  return (
    <DashboardLayout>
      <PageHeader title="Assignments" subtitle="Track homework, coursework assignments, and test schedules.">
        {isStaff && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer focus:outline-none"
          >
            + Add Assignment
          </button>
        )}
      </PageHeader>

      {loading ? (
        <div className="h-64 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 animate-pulse flex items-center justify-center text-slate-400" />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          onEdit={isStaff ? handleOpenEdit : undefined}
          onDelete={isStaff ? handleDelete : undefined}
        />
      )}

      {/* Creation Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEditMode ? "Edit Assignment" : "Create New Assignment"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              placeholder="Midterm React Project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Description / Task Instructions
            </label>
            <textarea
              placeholder="Describe the tasks, expectations, and requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm h-24 resize-none"
            />
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
                Assigning Teacher
              </label>
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              >
                <option value="" className="text-slate-800 dark:text-white bg-background">Select teacher</option>
                {teachersList.map((t) => (
                  <option key={t.id} value={t.id} className="text-slate-800 dark:text-white bg-background">
                    {t.user?.first_name ? `${t.user.first_name} ${t.user.last_name}` : t.user?.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              required
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
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Assignment"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
