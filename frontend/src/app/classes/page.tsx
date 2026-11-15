"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { classService } from "@/services/classService";
import { ClassItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPKR } from "@/lib/formatters";
import {
  Layers,
  Users,
  GraduationCap,
  Wallet,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Building,
} from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    section: "A",
    gradeLevel: 1,
    room: "Room 101",
    capacity: 40,
    tuitionFee: 3500,
    admissionFee: 5000,
    annualFund: 2000,
    examFee: 1000,
    classTeacher: "Sir Ahmed Farooq",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    const res = await classService.getAll();
    if (res.success && res.data) {
      setClasses(res.data);
    } else {
      setError(res.error || "Failed to load classes");
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "Class 1",
      section: "A",
      gradeLevel: 1,
      room: "Room 101",
      capacity: 40,
      tuitionFee: 3800,
      admissionFee: 5000,
      annualFund: 2000,
      examFee: 1000,
      classTeacher: "Miss Sadia Bibi",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c: ClassItem) => {
    setSelectedClass(c);
    setFormData({
      name: c.name,
      section: c.section,
      gradeLevel: c.gradeLevel,
      room: c.room,
      capacity: c.capacity,
      tuitionFee: c.tuitionFee,
      admissionFee: c.admissionFee,
      annualFund: c.annualFund,
      examFee: c.examFee,
      classTeacher: c.classTeacher || "",
    });
    setIsEditOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await classService.create(formData);
    if (res.success && res.data) {
      setSuccessMsg(`Class ${res.data.name} (${res.data.section}) created successfully!`);
      setIsAddOpen(false);
      fetchClasses();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Failed to create class");
    }
    setSubmitting(false);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setSubmitting(true);
    setError(null);

    const res = await classService.update(selectedClass.id, formData);
    if (res.success) {
      setSuccessMsg("Class details and fee structure updated!");
      setIsEditOpen(false);
      fetchClasses();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Failed to update class");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class section?")) return;
    const res = await classService.delete(id);
    if (res.success) {
      setSuccessMsg("Class section removed.");
      fetchClasses();
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.error || "Cannot delete class");
    }
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.section.toLowerCase().includes(search.toLowerCase()) ||
      (c.classTeacher && c.classTeacher.toLowerCase().includes(search.toLowerCase())) ||
      c.room.toLowerCase().includes(search.toLowerCase())
  );

  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const totalEnrolled = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const avgFee = classes.length
    ? Math.round(classes.reduce((sum, c) => sum + (c.tuitionFee || 0), 0) / classes.length)
    : 0;

  return (
    <DashboardLayout
      title="Class Structure & Fee Schedules"
      subtitle="Grade levels (Play Group to Class 10), classroom capacities, incharge teachers, and tuition structures"
    >
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Configured Classes</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{classes.length} Sections</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Play Group to Class 10</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Total Enrolled</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{totalEnrolled} Students</div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">Active enrollment</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Total Seating Capacity</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{totalCapacity} Desks</div>
            <div className="text-[10px] text-indigo-600/80 mt-0.5">Across all rooms</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Average Monthly Fee</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{formatPKR(avgFee)}</div>
            <div className="text-[10px] text-purple-600/80 mt-0.5">Tuition rate / month</div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by class name, section, teacher, room..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class Section</span>
        </button>
      </div>

      {/* Classes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading classes...</span>
            </div>
          </div>
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => {
            const enrolled = cls.studentCount ?? 0;
            const cap = cls.capacity || 40;
            const pct = Math.min(Math.round((enrolled / cap) * 100), 100);

            return (
              <div
                key={cls.id}
                className="p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3.5">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                        {cls.name} ({cls.section})
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Grade Tier: {cls.gradeLevel} • {cls.room}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold font-mono">
                      {enrolled} / {cap}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-medium">
                      <span>Occupancy</span>
                      <span>{pct}% filled</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">Class Incharge:</span>
                      <span className="font-semibold text-slate-800">{cls.classTeacher || "Unassigned"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">Monthly Tuition Fee:</span>
                      <span className="font-bold font-mono text-emerald-700">{formatPKR(cls.tuitionFee)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">Admission Fee:</span>
                      <span className="font-mono text-slate-700">{formatPKR(cls.admissionFee)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Annual Fund:</span>
                      <span className="font-mono text-slate-700">{formatPKR(cls.annualFund)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            No classes match your search query.
          </div>
        )}
      </div>

      {/* Add Class Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Class Section"
        description="Configure academic level, seating capacity, and tuition fee structure"
        maxWidth="md"
      >
        <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Class Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Class 6"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Section *</label>
              <input
                type="text"
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="A"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Grade Level *</label>
              <input
                type="number"
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Room No</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Room 101"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Capacity *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 40 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Class Incharge Teacher</label>
            <input
              type="text"
              value={formData.classTeacher}
              onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
              placeholder="e.g. Sir Ahmed Farooq"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
              Fee Schedules (PKR)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Monthly Tuition *</label>
                <input
                  type="number"
                  required
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData({ ...formData, tuitionFee: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Admission Fee</label>
                <input
                  type="number"
                  value={formData.admissionFee}
                  onChange={(e) => setFormData({ ...formData, admissionFee: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Annual Fund</label>
                <input
                  type="number"
                  value={formData.annualFund}
                  onChange={(e) => setFormData({ ...formData, annualFund: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Class Section
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Class Section & Fees"
        description="Modify section details, teacher assignment, or fee schedule"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateClass} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Class Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Section</label>
              <input
                type="text"
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Grade</label>
              <input
                type="number"
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Room No</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 40 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Incharge Teacher</label>
            <input
              type="text"
              value={formData.classTeacher}
              onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
              Fee Structure (PKR)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Monthly Tuition</label>
                <input
                  type="number"
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData({ ...formData, tuitionFee: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Admission Fee</label>
                <input
                  type="number"
                  value={formData.admissionFee}
                  onChange={(e) => setFormData({ ...formData, admissionFee: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Annual Fund</label>
                <input
                  type="number"
                  value={formData.annualFund}
                  onChange={(e) => setFormData({ ...formData, annualFund: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
