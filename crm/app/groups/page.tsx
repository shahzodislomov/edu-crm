"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [teacher, setTeacher] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Relational options
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);

  const fetchGroups = () => {
    setLoading(true);
    api
      .get(ENDPOINTS.groups.list)
      .then((res) => {
        setGroups(res.data.results || res.data || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGroups();
    api.get(ENDPOINTS.auth.me)
      .then((res) => {
        setUserRole(res.data.role);
      })
      .catch(console.error);
  }, []);

  // Fetch relational data when modal opens
  useEffect(() => {
    const isAllowed = userRole === "admin";
    if (isOpen && isAllowed) {
      api.get(ENDPOINTS.courses.list).then((res) => {
        setCoursesList(res.data.results || res.data || []);
      }).catch(console.error);

      api.get(ENDPOINTS.teachers.list).then((res) => {
        setTeachersList(res.data.results || res.data || []);
      }).catch(console.error);
    }
  }, [isOpen, userRole]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setName("");
    setCourse("");
    setTeacher("");
    setStartDate("");
    setEndDate("");
    setStatus("pending");
    setError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (groupObj: any) => {
    setIsEditMode(true);
    setEditingId(groupObj.id);
    setName(groupObj.name || "");
    setCourse(String(groupObj.course?.id || groupObj.course || ""));
    setTeacher(String(groupObj.teacher?.id || groupObj.teacher || ""));
    setStartDate(groupObj.start_date || "");
    setEndDate(groupObj.end_date || "");
    setStatus(groupObj.status || "pending");
    setError("");
    setIsOpen(true);
  };

  const handleDelete = async (groupObj: any) => {
    if (!window.confirm(`Are you sure you want to delete group "${groupObj.name}"?`)) {
      return;
    }
    try {
      await api.delete(`${ENDPOINTS.groups.list}${groupObj.id}/`);
      fetchGroups();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete study group.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      name,
      course: parseInt(course),
      teacher: parseInt(teacher),
      start_date: startDate,
      end_date: endDate || null,
      status,
    };

    try {
      if (isEditMode && editingId) {
        await api.put(`${ENDPOINTS.groups.list}${editingId}/`, payload);
      } else {
        await api.post(ENDPOINTS.groups.list, payload);
      }
      setIsOpen(false);
      fetchGroups();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save group details. Check fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "course_name", label: "Course" },
    { key: "teacher_name", label: "Teacher" },
    { key: "status", label: "Status" },
  ];

  const rows = groups.map((g) => ({
    id: g.id,
    name: g.name,
    course_name: g.course_name || g.course?.name || "-",
    teacher_name: g.teacher_name || (g.teacher?.user?.first_name ? `${g.teacher.user.first_name} ${g.teacher.user.last_name}` : g.teacher?.user?.username) || "-",
    status: g.status,
    // Keep course and teacher object IDs for pre-population in edit handler
    course: g.course,
    teacher: g.teacher,
    start_date: g.start_date,
    end_date: g.end_date,
  }));

  const isAdmin = userRole === "admin";

  return (
    <DashboardLayout>
      <PageHeader title="Groups" subtitle="Monitor active classes, student divisions, and study schedules.">
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer focus:outline-none"
          >
            + Add Group
          </button>
        )}
      </PageHeader>

      {loading ? (
        <div className="h-64 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 animate-pulse flex items-center justify-center text-slate-400" />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          onEdit={isAdmin ? handleOpenEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      )}

      {/* Creation Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEditMode ? "Edit Study Group" : "Create New Study Group"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Group Name
            </label>
            <input
              type="text"
              placeholder="Backend Node.js Group 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Course (Subject)
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              >
                <option value="" className="text-slate-800 dark:text-white bg-background">Select a course</option>
                {coursesList.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-800 dark:text-white bg-background">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Assigned Teacher
              </label>
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              >
                <option value="" className="text-slate-800 dark:text-white bg-background">Select a teacher</option>
                {teachersList.map((t) => (
                  <option key={t.id} value={t.id} className="text-slate-800 dark:text-white bg-background">
                    {t.user?.first_name ? `${t.user.first_name} ${t.user.last_name}` : t.user?.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              required
            >
              <option value="pending" className="text-slate-800 dark:text-white bg-background">Pending</option>
              <option value="active" className="text-slate-800 dark:text-white bg-background">Active</option>
              <option value="finished" className="text-slate-800 dark:text-white bg-background">Finished</option>
            </select>
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
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Group"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
