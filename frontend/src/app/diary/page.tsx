"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { diaryService } from "@/services/diaryService";
import { classService } from "@/services/classService";
import { DiaryNotice, ClassItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters";
import {
  BookOpen,
  Bell,
  Calendar,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryNotice[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter
  const [typeFilter, setTypeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    type: "Notice" as "Notice" | "Diary",
    title: "",
    content: "",
    targetType: "All" as "All" | "Class",
    classSectionId: 1,
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [entriesRes, classesRes] = await Promise.all([
      diaryService.getEntries(),
      classService.getAll(),
    ]);

    if (entriesRes.success && entriesRes.data) setEntries(entriesRes.data);
    if (classesRes.success && classesRes.data) {
      const clsList = classesRes.data;
      setClasses(clsList);
      if (clsList.length > 0) setFormData((prev) => ({ ...prev, classSectionId: clsList[0].id }));
    }
    setLoading(false);
  };

  const fetchEntries = async () => {
    setLoading(true);
    const res = await diaryService.getEntries({ type: typeFilter, classSectionId: classFilter });
    if (res.success && res.data) setEntries(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [typeFilter, classFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await diaryService.createEntry({
      type: formData.type,
      title: formData.title,
      content: formData.content,
      targetType: formData.targetType,
      classSectionId: formData.targetType === "Class" ? formData.classSectionId : undefined,
      date: formData.date,
    });

    if (res.success && res.data) {
      setSuccessMsg(`Posted ${formData.type}: "${res.data.title}" successfully.`);
      setIsAddOpen(false);
      fetchEntries();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Failed to post entry");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this notice/diary entry?")) return;
    const res = await diaryService.deleteEntry(id);
    if (res.success) {
      setSuccessMsg("Entry removed.");
      fetchEntries();
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Metrics
  const totalEntries = entries.length;
  const noticeCount = entries.filter((e) => e.type === "Notice").length;
  const diaryCount = entries.filter((e) => e.type === "Diary").length;

  return (
    <DashboardLayout
      title="School Notices & Daily Diary"
      subtitle="Whole school circulars, parent notices, and class-specific daily homework diary"
    >
      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 font-bold text-sm">×</button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 font-bold text-sm">×</button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Broadcasts</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{totalEntries}</p>
            <p className="text-[11px] text-slate-500 mt-1">Active communication entries</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Official Notices</p>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-0.5">{noticeCount}</p>
            <p className="text-[11px] text-purple-600 font-medium mt-1">Circulars & Announcements</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class Homework Diaries</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">{diaryCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Daily classroom tasks</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs mb-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5 w-full">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="all">All Post Types (Notices & Diary)</option>
            <option value="Notice">Official Notices</option>
            <option value="Diary">Daily Homework Diary</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="all">All Audiences (Whole School / Classes)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Post Notice / Diary
        </button>
      </div>

      {/* Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Loading notices & diary...
          </div>
        ) : entries.length > 0 ? (
          entries.map((item) => (
            <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.type === "Notice"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Audience: {item.targetType === "All" ? "Whole School" : "Specific Class"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{formatDate(item.date)}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 mb-1.5 leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{item.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Posted by: <strong className="text-slate-700">{item.createdBy}</strong></span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-rose-600 hover:text-rose-800 cursor-pointer font-medium flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            No notices or diary entries found.
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Post Notice or Daily Class Diary"
        description="Broadcast circulars to whole school or write homework diary for a class"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Entry Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "Notice" | "Diary" })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="Notice">School Notice</option>
                <option value="Diary">Daily Homework Diary</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Audience *</label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value as "All" | "Class" })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="All">All Students & Parents</option>
                <option value="Class">Specific Class</option>
              </select>
            </div>
          </div>

          {formData.targetType === "Class" && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Class Section *</label>
              <select
                value={formData.classSectionId}
                onChange={(e) => setFormData({ ...formData, classSectionId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.section})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Title / Subject *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Science Test Homework / PTM Schedule"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Content / Diary Tasks *</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write circular content or homework instructions"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} size="sm">
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
