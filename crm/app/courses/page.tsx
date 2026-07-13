"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";
import type { Course } from "@/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");

  // Modal Mode State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = () => {
    setLoading(true);
    api
      .get(ENDPOINTS.courses.list)
      .then((res) => {
        setCourses(res.data.results || res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch courses:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
    api.get(ENDPOINTS.auth.me)
      .then((res) => {
        setUserRole(res.data.role);
      })
      .catch(console.error);
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setDuration("");
    setPrice("");
    setError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setIsEditMode(true);
    setEditingId(course.id);
    setName(course.name || "");
    setDescription(course.description || "");
    setDuration(String(course.duration_months || ""));
    setPrice(String(course.price || ""));
    setError("");
    setIsOpen(true);
  };

  const handleDelete = async (course: Course) => {
    if (!window.confirm(`Are you sure you want to delete course "${course.name}"?`)) {
      return;
    }
    try {
      await api.delete(`${ENDPOINTS.courses.list}${course.id}/`);
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete course.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      name,
      description,
      duration_months: parseInt(duration),
      price: parseFloat(price),
    };

    try {
      if (isEditMode && editingId) {
        await api.put(`${ENDPOINTS.courses.list}${editingId}/`, payload);
      } else {
        await api.post(ENDPOINTS.courses.list, payload);
      }
      setIsOpen(false);
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save course. Check fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Course Name" },
    { key: "description", label: "Description" },
    { key: "duration_months", label: "Duration (Months)" },
    { key: "price", label: "Price" },
  ];

  const isAdmin = userRole === "admin";

  return (
    <DashboardLayout>
      <PageHeader title="Courses" subtitle="View and manage education curriculum offerings and course lists.">
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer focus:outline-none"
          >
            + Add Course
          </button>
        )}
      </PageHeader>

      {loading ? (
        <div className="h-64 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-card p-6 animate-pulse flex items-center justify-center text-slate-400">
          Loading courses...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          onEdit={isAdmin ? handleOpenEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      )}

      {/* Form Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEditMode ? "Edit Course" : "Create New Course"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Course Name
            </label>
            <input
              type="text"
              placeholder="Fullstack JavaScript Developer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              placeholder="Provide a brief course description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Duration (Months)
              </label>
              <input
                type="number"
                placeholder="6"
                min="1"
                max="36"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Price (USD)
              </label>
              <input
                type="number"
                placeholder="200"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 px-4 py-2.5 text-foreground placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              />
            </div>
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
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
