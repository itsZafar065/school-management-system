"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { teacherService } from "@/services/teacherService";
import { Staff } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatPKR, formatDate, formatCNIC, formatPhone } from "@/lib/formatters";
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Phone,
  Briefcase,
  Wallet,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

export default function TeachersPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    phone: "",
    email: "",
    designation: "Senior Mathematics Teacher",
    role: "Teacher" as "Teacher" | "Staff",
    qualification: "M.Sc. Mathematics",
    basicSalary: 45000,
    allowance: 4000,
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    setError(null);
    const res = await teacherService.getAll({
      search,
      role: roleFilter,
      status: "Active",
    });
    if (res.success && res.data) {
      setStaffList(res.data);
    } else {
      setError(res.error || "Failed to load staff list.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStaff();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      cnic: "",
      phone: "",
      email: "",
      designation: "Subject Teacher",
      role: "Teacher",
      qualification: "M.A. / M.Sc.",
      basicSalary: 40000,
      allowance: 3000,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (st: Staff) => {
    setSelectedStaff(st);
    setFormData({
      name: st.name,
      cnic: st.cnic,
      phone: st.phone,
      email: st.email || "",
      designation: st.designation,
      role: st.role,
      qualification: st.qualification,
      basicSalary: st.basicSalary,
      allowance: st.allowance,
    });
    setIsEditOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await teacherService.create(formData);
    if (res.success && res.data) {
      setSuccessMsg(`Staff member ${res.data.name} registered with Employee ID: ${res.data.employeeNo}!`);
      setIsAddOpen(false);
      loadStaff();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Failed to register staff member.");
    }
    setSubmitting(false);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setSubmitting(true);
    setError(null);

    const res = await teacherService.update(selectedStaff.id, formData);
    if (res.success) {
      setSuccessMsg("Staff member records updated successfully!");
      setIsEditOpen(false);
      loadStaff();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Failed to update staff.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to mark this staff member as Left?")) return;
    const res = await teacherService.delete(id);
    if (res.success) {
      setSuccessMsg("Staff member marked as Left.");
      loadStaff();
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const teachersCount = staffList.filter((s) => s.role === "Teacher").length;
  const nonTeachingCount = staffList.filter((s) => s.role === "Staff").length;
  const totalPayroll = staffList.reduce((sum, s) => sum + (s.basicSalary || 0), 0);

  return (
    <DashboardLayout
      title="Faculty & Staff Register"
      subtitle="Teachers, non-teaching employees, designations, CNICs, qualifications, and pay scales"
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
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Employees</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{staffList.length} Staff</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Teaching & Admin</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Teaching Faculty</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{teachersCount} Teachers</div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">Active educators</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Non-Teaching Staff</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{nonTeachingCount} Staff</div>
            <div className="text-[10px] text-indigo-600/80 mt-0.5">Admin & Support</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Monthly Payroll</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{formatPKR(totalPayroll)}</div>
            <div className="text-[10px] text-purple-600/80 mt-0.5">Basic salary total</div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5 w-full">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Employee No, Name, CNIC, Designation..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Staff (Teaching & Non-Teaching)</option>
            <option value="Teacher">Teaching Faculty</option>
            <option value="Staff">Non-Teaching Staff</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Staff Member</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-800">Faculty & Staff Directory</span>
            <span className="text-[11px] text-slate-500">({staffList.length} members)</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Sorted by Employee ID
          </div>
        </div>

        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Emp No</th>
                <th className="py-3 px-4 whitespace-nowrap">Staff Member</th>
                <th className="py-3 px-3 whitespace-nowrap">Role</th>
                <th className="py-3 px-4 whitespace-nowrap">Designation</th>
                <th className="py-3 px-3.5 whitespace-nowrap">CNIC</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Phone</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Qualification</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-right">Basic Pay</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading staff directory...</span>
                    </div>
                  </td>
                </tr>
              ) : staffList.length > 0 ? (
                staffList.map((st) => (
                  <tr key={st.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                        {st.employeeNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs leading-snug">{st.name}</div>
                          {st.email && <div className="text-[10px] text-slate-400 font-mono">{st.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        st.role === "Teacher"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {st.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                      {st.designation}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-600">
                      {st.cnic}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{st.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                      {st.qualification}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                      {formatPKR(st.basicSalary)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        st.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(st.id)}
                          className="p-1.5 border border-slate-200 hover:border-rose-300 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Mark as Left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No staff records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Faculty / Staff Member"
        description="Add a new teacher or administrative employee with basic pay and credentials"
        maxWidth="md"
      >
        <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sir Naveed Qureshi"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">CNIC Number *</label>
              <input
                type="text"
                required
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: formatCNIC(e.target.value) })}
                placeholder="35201-1234567-1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                placeholder="0300-1234567"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Role Type *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "Teacher" | "Staff" })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold"
              >
                <option value="Teacher">Teaching Faculty</option>
                <option value="Staff">Non-Teaching Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Science Teacher"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. M.Sc. Physics"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@school.edu.pk"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
              Salary Structure (PKR)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Basic Monthly Pay *</label>
                <input
                  type="number"
                  required
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Allowances (Medical/Adhoc)</label>
                <input
                  type="number"
                  value={formData.allowance}
                  onChange={(e) => setFormData({ ...formData, allowance: parseInt(e.target.value) || 0 })}
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
              Register Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Staff Member Details"
        description="Modify pay scale, designation, or contact details"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateStaff} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">CNIC</label>
              <input
                type="text"
                required
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: formatCNIC(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "Teacher" | "Staff" })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900"
              >
                <option value="Teacher">Teaching Faculty</option>
                <option value="Staff">Non-Teaching Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Designation</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
              Salary Details (PKR)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Basic Monthly Pay</label>
                <input
                  type="number"
                  required
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[10px] mb-0.5">Allowances</label>
                <input
                  type="number"
                  value={formData.allowance}
                  onChange={(e) => setFormData({ ...formData, allowance: parseInt(e.target.value) || 0 })}
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
