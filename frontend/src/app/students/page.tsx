"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { studentService } from "@/services/studentService";
import { classService } from "@/services/classService";
import { settingsService } from "@/services/settingsService";
import { Student, ClassItem, SchoolSetting } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatPKR, formatDate, formatCNIC, formatPhone, isValidCNIC, isValidPhone } from "@/lib/formatters";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  FileText,
  Printer,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  Phone,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [setting, setSetting] = useState<SchoolSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("Active");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPrintAdmissionOpen, setIsPrintAdmissionOpen] = useState(false);
  const [isPrintCertOpen, setIsPrintCertOpen] = useState(false);
  const [certType, setCertType] = useState<"Leaving" | "Character">("Leaving");
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sibling detection state in form
  const [detectedSiblings, setDetectedSiblings] = useState<Student[]>([]);

  // Admission Form State
  const [formData, setFormData] = useState({
    name: "",
    nameUrdu: "",
    admissionNo: "",
    rollNo: "",
    bFormNo: "",
    dob: "2015-05-10",
    gender: "Male",
    religion: "Islam",
    bloodGroup: "B+",
    previousSchool: "",
    classSectionId: 1,
    fatherName: "",
    fatherCnic: "",
    fatherOccupation: "Govt Employee",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    guardianName: "",
    guardianRelation: "Father",
    guardianPhone: "",
    address: "",
    emergencyContact: "",
    medicalNotes: "None",
    discountType: "None" as "None" | "Sibling" | "StaffChild" | "Concession",
    discountAmount: 0,
    discountReason: "",
  });

  // Promote form state
  const [promoteClassId, setPromoteClassId] = useState<number>(1);
  const [promoteSession, setPromoteSession] = useState("2026-2027");
  const [promoteResult, setPromoteResult] = useState("Promoted");

  // Status/Leaving form state
  const [newStatus, setNewStatus] = useState<"Active" | "Left" | "StruckOff">("Left");
  const [leavingReason, setLeavingReason] = useState("");
  const [leavingDate, setLeavingDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [stusRes, classesRes, setRes] = await Promise.all([
      studentService.getAll({ status: selectedStatus }),
      classService.getAll(),
      settingsService.getSettings(),
    ]);

    if (stusRes.success && stusRes.data) setStudents(stusRes.data);
    if (classesRes.success && classesRes.data) {
      const clsArr = classesRes.data;
      setClasses(clsArr);
      if (clsArr.length > 0) {
        setFormData((prev) => ({ ...prev, classSectionId: clsArr[0].id }));
        setPromoteClassId(clsArr[0].id);
      }
    }
    if (setRes.success && setRes.data) setSetting(setRes.data);
    setLoading(false);
  };

  const handleFilter = async () => {
    setLoading(true);
    const res = await studentService.getAll({
      search,
      classSectionId: selectedClassId,
      status: selectedStatus,
    });
    if (res.success && res.data) setStudents(res.data);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilter();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedClassId, selectedStatus]);

  // Sibling lookup when Father CNIC changes
  const handleFatherCnicChange = async (val: string) => {
    const masked = formatCNIC(val);
    setFormData((prev) => ({ ...prev, fatherCnic: masked }));

    if (masked.length === 15) {
      const res = await studentService.getSiblings(masked);
      const sibArr = res.data;
      if (res.success && sibArr && sibArr.length > 0) {
        setDetectedSiblings(sibArr);
        // Automatically offer sibling concession
        const selectedCls = classes.find((c) => c.id === formData.classSectionId);
        const discountVal = Math.round((selectedCls?.tuitionFee || 3500) * 0.2);
        setFormData((prev) => ({
          ...prev,
          discountType: "Sibling",
          discountAmount: discountVal,
          discountReason: `Sibling concession: Brother/Sister of ${sibArr[0].name} (${sibArr[0].admissionNo})`,
        }));
      } else {
        setDetectedSiblings([]);
      }
    } else {
      setDetectedSiblings([]);
    }
  };

  const handleOpenAdd = () => {
    const nextGR = `GR-${1000 + students.length + 1}`;
    const nextRoll = `SMS-${String(students.length + 1).padStart(3, "0")}`;
    setFormData({
      name: "",
      nameUrdu: "",
      admissionNo: nextGR,
      rollNo: nextRoll,
      bFormNo: "",
      dob: "2015-05-10",
      gender: "Male",
      religion: "Islam",
      bloodGroup: "B+",
      previousSchool: "",
      classSectionId: classes[0]?.id || 1,
      fatherName: "",
      fatherCnic: "",
      fatherOccupation: "Businessman",
      fatherPhone: "",
      motherName: "",
      motherPhone: "",
      guardianName: "",
      guardianRelation: "Father",
      guardianPhone: "",
      address: "Street 5, Sector B-1, Johar Town, Lahore",
      emergencyContact: "",
      medicalNotes: "None",
      discountType: "None",
      discountAmount: 0,
      discountReason: "",
    });
    setDetectedSiblings([]);
    setIsAddOpen(true);
  };

  const handleSaveAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await studentService.create(formData);
    if (res.success && res.data) {
      setSuccessMsg(`Student ${res.data.name} admitted successfully with Permanent GR No: ${res.data.admissionNo}!`);
      setIsAddOpen(false);
      handleFilter();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Admission failed.");
    }
    setSubmitting(false);
  };

  const handleOpenProfile = async (student: Student) => {
    setLoading(true);
    const res = await studentService.getById(student.id);
    if (res.success && res.data) {
      setSelectedStudent(res.data);
      setIsProfileOpen(true);
    }
    setLoading(false);
  };

  const handlePromoteConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    const res = await studentService.promote(selectedStudent.id, promoteClassId, promoteSession, promoteResult);
    if (res.success && res.data) {
      setSuccessMsg(`Student ${res.data.name} promoted to Class ${res.data.classSection?.name}!`);
      setIsPromoteOpen(false);
      setIsProfileOpen(false);
      handleFilter();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Promotion failed");
    }
    setSubmitting(false);
  };

  const handleStatusConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    const res = await studentService.updateStatus(selectedStudent.id, newStatus, leavingDate, leavingReason);
    if (res.success && res.data) {
      setSuccessMsg(`Student record updated to status: ${newStatus}`);
      setIsStatusOpen(false);
      setIsProfileOpen(false);
      handleFilter();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Status update failed");
    }
    setSubmitting(false);
  };

  return (
    <DashboardLayout
      title="Student Lifetime Register"
      subtitle="Permanent student enrollment records, admission forms, promotions, and certificates"
    >
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded">
          {error}
        </div>
      )}

      {/* 4 Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{students.length} Students</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Permanent GR records</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Active Students</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {students.filter((s) => s.status === "Active").length} Students
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">Currently studying</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Left / SLC Issued</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {students.filter((s) => s.status === "Left" || s.status === "StruckOff").length} Students
            </div>
            <div className="text-[10px] text-rose-600/80 mt-0.5">Archived records</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Fee Concessions</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {students.filter((s) => s.discountType !== "None").length} Students
            </div>
            <div className="text-[10px] text-purple-600/80 mt-0.5">Sibling & staff discounts</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search + Filters + New Admission Button */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5 w-full">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by GR No, Student Name, Father Name, B-Form..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Classes & Sections</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Class {c.name} ({c.section})
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Active">Active Only</option>
              <option value="Left">Left / SLC Issued</option>
              <option value="all">All Lifetime Records</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-600/30 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Admission (A4 Form)</span>
        </button>
      </div>

      {/* Students Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-800">Permanent Student Register</span>
            <span className="text-[11px] text-slate-500">({students.length} records found)</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Sorted by Class & Roll No
          </div>
        </div>

        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs">
              <tr className="uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3.5 whitespace-nowrap">GR / Adm No</th>
                <th className="py-3 px-3 whitespace-nowrap">Roll No</th>
                <th className="py-3 px-4 whitespace-nowrap">Student Particulars</th>
                <th className="py-3 px-3.5 whitespace-nowrap">B-Form / CNIC</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Class & Section</th>
                <th className="py-3 px-4 whitespace-nowrap">Father Name & Contact</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Concession</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium">Loading permanent student records...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* GR No */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200/60 text-blue-700 text-xs">
                        {stu.admissionNo}
                      </span>
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono font-medium text-slate-600">
                      {stu.rollNo}
                    </td>

                    {/* Student Name + Urdu */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {stu.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs leading-snug">{stu.name}</div>
                          {stu.nameUrdu ? (
                            <div className="text-[11px] text-emerald-800 font-urdu leading-tight font-medium">
                              {stu.nameUrdu}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 capitalize">{stu.gender} • {stu.bloodGroup || "B+"}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* B-Form No */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-700 font-medium">
                      {stu.bFormNo}
                    </td>

                    {/* Class */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200 text-xs">
                        {stu.classSection?.name} ({stu.classSection?.section})
                      </span>
                    </td>

                    {/* Father Name & Phone */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900 text-xs leading-snug">{stu.fatherName}</div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{stu.fatherPhone}</span>
                      </div>
                    </td>

                    {/* Concession */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {stu.discountType !== "None" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {stu.discountType} (-{formatPKR(stu.discountAmount)})
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          stu.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {stu.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenProfile(stu)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 hover:border-blue-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Profile & Docs</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-slate-300" />
                      <div className="text-sm font-semibold text-slate-700">No student records found</div>
                      <p className="text-xs text-slate-400">Try adjusting your search query or class filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Form Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Student Admission Form (Permanent Record)"
        description="Enter official student bio-data, B-Form, parent details, and sibling linkage"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAdmission} className="space-y-3 text-xs">
          {/* Sibling Alert Banner */}
          {detectedSiblings.length > 0 && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded">
              <span className="font-bold">Sibling Detected:</span> Matching Father CNIC found with{" "}
              {detectedSiblings.map((s) => `${s.name} (${s.admissionNo} - ${s.classSection?.name})`).join(", ")}.
              20% Sibling Concession automatically applied.
            </div>
          )}

          <div className="font-semibold text-zinc-900 border-b border-zinc-200 pb-1">
            1. Student Bio-Data
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Student Name (English) *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Muhammad Ali"
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Student Name (Urdu)</label>
              <input
                type="text"
                value={formData.nameUrdu}
                onChange={(e) => setFormData({ ...formData, nameUrdu: e.target.value })}
                placeholder="محمد علی"
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">B-Form Number (13 Digits) *</label>
              <input
                type="text"
                required
                value={formData.bFormNo}
                onChange={(e) => setFormData({ ...formData, bFormNo: formatCNIC(e.target.value) })}
                placeholder="35201-1234567-1"
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Religion</label>
              <input
                type="text"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              >
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="font-semibold text-zinc-900 border-b border-zinc-200 pb-1 pt-2">
            2. Class Assignment & Academic Record
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Admission / GR No (Permanent) *</label>
              <input
                type="text"
                required
                value={formData.admissionNo}
                onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-zinc-50 font-mono font-bold text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Class Applied *</label>
              <select
                value={formData.classSectionId}
                onChange={(e) => setFormData({ ...formData, classSectionId: parseInt(e.target.value) })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 font-semibold"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.section}) - Tuition: {formatPKR(c.tuitionFee)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Previous School / Transfer</label>
              <input
                type="text"
                value={formData.previousSchool}
                onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                placeholder="e.g. Govt Primary School"
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
          </div>

          <div className="font-semibold text-zinc-900 border-b border-zinc-200 pb-1 pt-2">
            3. Parent / Guardian Details (CNIC for Sibling Detection)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Father Name *</label>
              <input
                type="text"
                required
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="e.g. Tariq Ahmad"
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Father CNIC (Sibling Match) *</label>
              <input
                type="text"
                required
                value={formData.fatherCnic}
                onChange={(e) => handleFatherCnicChange(e.target.value)}
                placeholder="35201-1234567-1"
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Father Phone *</label>
              <input
                type="text"
                required
                value={formData.fatherPhone}
                onChange={(e) => setFormData({ ...formData, fatherPhone: formatPhone(e.target.value) })}
                placeholder="0300-1234567"
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Father Occupation</label>
              <input
                type="text"
                value={formData.fatherOccupation}
                onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Mother Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Residential Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
          </div>

          <div className="font-semibold text-zinc-900 border-b border-zinc-200 pb-1 pt-2">
            4. Fee Concession & Discounts
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Concession Type</label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as "None" | "Sibling" | "StaffChild" | "Concession",
                  })
                }
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              >
                <option value="None">None (Full Fee)</option>
                <option value="Sibling">Sibling Discount (20%)</option>
                <option value="StaffChild">Staff Child (50%)</option>
                <option value="Concession">Special Concession</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Concession Amount (PKR)</label>
              <input
                type="number"
                value={formData.discountAmount}
                onChange={(e) => setFormData({ ...formData, discountAmount: parseInt(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Concession Approval Reason</label>
              <input
                type="text"
                value={formData.discountReason}
                onChange={(e) => setFormData({ ...formData, discountReason: e.target.value })}
                placeholder="Reason or Principal approval note"
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} size="sm">
              Save Admission (Permanent Record)
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Profile & History Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          title={`Permanent Student Record: ${selectedStudent.name}`}
          description={`GR Number: ${selectedStudent.admissionNo} • Status: ${selectedStudent.status}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header Bio */}
            <div className="p-3 bg-zinc-50 border border-zinc-300 rounded grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-zinc-500 block text-[10px]">Admission No</span>
                <span className="font-bold text-zinc-900 font-mono">{selectedStudent.admissionNo}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Class & Section</span>
                <span className="font-bold text-zinc-900">{selectedStudent.classSection?.name} ({selectedStudent.classSection?.section})</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">B-Form No</span>
                <span className="font-mono text-zinc-900">{selectedStudent.bFormNo}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Admission Date</span>
                <span>{formatDate(selectedStudent.admissionDate)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Father Name</span>
                <span className="font-medium text-zinc-900">{selectedStudent.fatherName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Father CNIC</span>
                <span className="font-mono text-zinc-900">{selectedStudent.fatherCnic}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Phone</span>
                <span className="font-mono text-zinc-900">{selectedStudent.fatherPhone}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Monthly Concession</span>
                <span className="font-semibold text-emerald-800">{formatPKR(selectedStudent.discountAmount)}</span>
              </div>
            </div>

            {/* Sibling Links */}
            {selectedStudent.siblings && selectedStudent.siblings.length > 0 && (
              <div className="p-3 border border-zinc-200 rounded">
                <div className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider mb-1">
                  Linked Siblings in School (Same Father CNIC)
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.siblings.map((sib) => (
                    <div key={sib.id} className="p-1.5 px-2.5 bg-zinc-100 rounded border border-zinc-300 text-[11px]">
                      <span className="font-semibold text-zinc-900">{sib.name}</span>{" "}
                      <span className="text-zinc-500">({sib.admissionNo} - {sib.classSection?.name})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Year-wise Academic History */}
            <div className="border border-zinc-200 rounded overflow-hidden">
              <div className="p-2 bg-zinc-100 font-bold text-zinc-800 text-[11px] uppercase tracking-wider">
                Year-Wise Session History
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                  <tr>
                    <th className="py-1.5 px-3">Session</th>
                    <th className="py-1.5 px-3">Class</th>
                    <th className="py-1.5 px-3">Attendance %</th>
                    <th className="py-1.5 px-3">Result</th>
                    <th className="py-1.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {selectedStudent.history && selectedStudent.history.length > 0 ? (
                    selectedStudent.history.map((h) => (
                      <tr key={h.id}>
                        <td className="py-1.5 px-3 font-medium">{h.sessionYear}</td>
                        <td className="py-1.5 px-3">{h.className} ({h.section})</td>
                        <td className="py-1.5 px-3">{h.attendancePercentage}%</td>
                        <td className="py-1.5 px-3 font-semibold text-emerald-700">{h.finalResult}</td>
                        <td className="py-1.5 px-3 text-zinc-500">{h.remarks || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-2 px-3 text-zinc-400">
                        Current session (2025-2026) in progress.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Actions: Promote, Status / Leaving, Print Admission Form, Print SLC */}
            <div className="pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPrintAdmissionOpen(true)}
                >
                  Print Admission Form (A4)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCertType("Leaving");
                    setIsPrintCertOpen(true);
                  }}
                >
                  Print School Leaving Cert (A4)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCertType("Character");
                    setIsPrintCertOpen(true);
                  }}
                >
                  Print Character Cert
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setNewStatus(selectedStudent.status === "Active" ? "Left" : "Active");
                    setIsStatusOpen(true);
                  }}
                >
                  Update Status / Mark Left
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsPromoteOpen(true)}
                >
                  Promote to Next Class
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Promotion Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isPromoteOpen}
          onClose={() => setIsPromoteOpen(false)}
          title={`Promote Student: ${selectedStudent.name} (${selectedStudent.admissionNo})`}
          description="Promote student to next class section while preserving previous session history"
          maxWidth="sm"
        >
          <form onSubmit={handlePromoteConfirm} className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Target Class *</label>
              <select
                value={promoteClassId}
                onChange={(e) => setPromoteClassId(parseInt(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 font-semibold"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.section})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Session Year</label>
              <input
                type="text"
                value={promoteSession}
                onChange={(e) => setPromoteSession(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Result Status</label>
              <select
                value={promoteResult}
                onChange={(e) => setPromoteResult(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              >
                <option value="Promoted">Promoted</option>
                <option value="Passed">Passed</option>
                <option value="HeldBack">Held Back (Repeat)</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPromoteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} size="sm">
                Confirm Promotion
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Status Update / Mark Left Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          title={`Update Status: ${selectedStudent.name}`}
          maxWidth="sm"
        >
          <form onSubmit={handleStatusConfirm} className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as "Active" | "Left" | "StruckOff")}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              >
                <option value="Active">Active</option>
                <option value="Left">Left (SLC Issued)</option>
                <option value="StruckOff">Struck Off</option>
              </select>
            </div>
            {newStatus === "Left" && (
              <>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Leaving Date</label>
                  <input
                    type="date"
                    value={leavingDate}
                    onChange={(e) => setLeavingDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Reason for Leaving</label>
                  <input
                    type="text"
                    value={leavingReason}
                    onChange={(e) => setLeavingReason(e.target.value)}
                    placeholder="e.g. Relocated to another city / Completed studies"
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
                  />
                </div>
              </>
            )}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsStatusOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} size="sm">
                Save Status
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable A4 Admission Form Modal */}
      {selectedStudent && isPrintAdmissionOpen && (
        <Modal
          isOpen={isPrintAdmissionOpen}
          onClose={() => setIsPrintAdmissionOpen(false)}
          title="Printable Admission Form (A4)"
          maxWidth="4xl"
        >
          <div className="print:m-0 print:p-0">
            <div className="flex justify-end mb-3 print:hidden">
              <Button size="sm" onClick={() => window.print()}>
                Print Form
              </Button>
            </div>
            {/* A4 Form Container */}
            <div className="border border-zinc-400 p-8 bg-white text-black font-serif text-xs leading-relaxed max-w-[210mm] mx-auto print:border-none print:p-0">
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h1 className="text-xl font-bold uppercase tracking-wider">{setting?.schoolName}</h1>
                <p className="text-xs">{setting?.address} • Phone: {setting?.phone}</p>
                <p className="text-[10px] text-zinc-600">Govt Reg No: {setting?.regNo} • Academic Session: {setting?.sessionYear}</p>
                <div className="mt-2 inline-block px-4 py-1 border border-black font-bold uppercase text-xs tracking-widest bg-zinc-100">
                  Official Student Admission Form
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4 border border-black p-3 text-[11px]">
                <div className="col-span-2"><strong>Admission / GR No:</strong> {selectedStudent.admissionNo}</div>
                <div><strong>Roll No:</strong> {selectedStudent.rollNo}</div>
                <div><strong>Class Admitted:</strong> {selectedStudent.classSection?.name}</div>
                <div className="col-span-2"><strong>Student Name (English):</strong> {selectedStudent.name}</div>
                <div className="col-span-2"><strong>Student Name (Urdu):</strong> {selectedStudent.nameUrdu || "-"}</div>
                <div><strong>B-Form No:</strong> {selectedStudent.bFormNo}</div>
                <div><strong>Date of Birth:</strong> {formatDate(selectedStudent.dob)}</div>
                <div><strong>Gender:</strong> {selectedStudent.gender}</div>
                <div><strong>Blood Group:</strong> {selectedStudent.bloodGroup || "-"}</div>
                <div className="col-span-2"><strong>Father Name:</strong> {selectedStudent.fatherName}</div>
                <div className="col-span-2"><strong>Father CNIC:</strong> {selectedStudent.fatherCnic}</div>
                <div className="col-span-2"><strong>Father Occupation:</strong> {selectedStudent.fatherOccupation || "-"}</div>
                <div className="col-span-2"><strong>Father Phone:</strong> {selectedStudent.fatherPhone}</div>
                <div className="col-span-4"><strong>Permanent Address:</strong> {selectedStudent.address}</div>
                <div className="col-span-2"><strong>Emergency Contact:</strong> {selectedStudent.emergencyContact || selectedStudent.fatherPhone}</div>
                <div className="col-span-2"><strong>Medical Notes:</strong> {selectedStudent.medicalNotes || "None"}</div>
              </div>

              {/* Declarations & Signatures */}
              <div className="border border-black p-3 mb-6 text-[10px]">
                <p className="font-bold mb-1">Parent / Guardian Declaration:</p>
                <p>
                  I solemnly declare that the particulars given above are correct to the best of my knowledge. I agree to abide by the rules, discipline, and fee policies of the school.
                </p>
              </div>

              <div className="grid grid-cols-3 text-center pt-8 border-t border-black text-xs">
                <div>
                  <div className="border-t border-black mx-4 pt-1 font-semibold">Parent / Guardian Signature</div>
                </div>
                <div>
                  <div className="border-t border-black mx-4 pt-1 font-semibold">Admission Clerk Signature</div>
                </div>
                <div>
                  <div className="border-t border-black mx-4 pt-1 font-semibold">Principal Stamp & Signature</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Printable Certificate (Leaving or Character) Modal */}
      {selectedStudent && isPrintCertOpen && (
        <Modal
          isOpen={isPrintCertOpen}
          onClose={() => setIsPrintCertOpen(false)}
          title={`Printable ${certType} Certificate (A4)`}
          maxWidth="4xl"
        >
          <div className="print:m-0 print:p-0">
            <div className="flex justify-end mb-3 print:hidden">
              <Button size="sm" onClick={() => window.print()}>
                Print Certificate
              </Button>
            </div>
            <div className="border-4 border-double border-black p-10 bg-white text-black font-serif text-xs leading-loose max-w-[210mm] mx-auto print:border-none print:p-0">
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase tracking-wider">{setting?.schoolName}</h1>
                <p className="text-xs">{setting?.address} • Phone: {setting?.phone}</p>
                <p className="text-[10px]">Recognized by Directorate of Public Instruction • Reg No: {setting?.regNo}</p>
                <div className="mt-4 inline-block px-6 py-1 border-2 border-black font-bold uppercase text-sm tracking-widest bg-zinc-100">
                  {certType === "Leaving" ? "School Leaving Certificate" : "Character Certificate"}
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed pt-4">
                <p>
                  This is to certify that <strong>{selectedStudent.name}</strong>, Son/Daughter of{" "}
                  <strong>{selectedStudent.fatherName}</strong> (Father CNIC: <strong>{selectedStudent.fatherCnic}</strong>), holding B-Form No.{" "}
                  <strong>{selectedStudent.bFormNo}</strong> was a bona fide student of this institution.
                </p>
                <p>
                  He/She was admitted to this institution on <strong>{formatDate(selectedStudent.admissionDate)}</strong> under Permanent Lifetime Admission Register Number <strong>{selectedStudent.admissionNo}</strong>.
                </p>
                <p>
                  At the time of leaving the school, he/she was studying in class{" "}
                  <strong>{selectedStudent.classSection?.name} ({selectedStudent.classSection?.section})</strong>.
                </p>
                <p>
                  Date of birth according to the Admission Register is <strong>{formatDate(selectedStudent.dob)}</strong>.
                </p>
                <p>
                  His/Her conduct and character during the period of stay in this institution were found to be <strong>Exemplary and Satisfactory</strong>. All school dues have been cleared.
                </p>
                <p>
                  Reason for leaving: <strong>{selectedStudent.leavingReason || "Passed out / Parents request"}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 text-center pt-24 text-xs font-semibold">
                <div>
                  <div className="border-t border-black mx-12 pt-1">Prepared by (Clerk)</div>
                </div>
                <div>
                  <div className="border-t border-black mx-12 pt-1">
                    {setting?.principalName || "Principal"}<br />
                    Head of Institution
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
