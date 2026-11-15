"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { leaveService } from "@/services/leaveService";
import { teacherService } from "@/services/teacherService";
import { studentService } from "@/services/studentService";
import { LeaveApplication, Staff, Student } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  User,
  GraduationCap,
} from "lucide-react";

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Apply Modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [actionType, setActionType] = useState<"Approved" | "Rejected">("Approved");
  const [actionRemarks, setActionRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    applicantType: "Staff" as "Staff" | "Student",
    staffId: 1,
    studentId: 1,
    leaveType: "Casual" as "Casual" | "Medical" | "Annual" | "Unpaid",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    days: 1,
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [leavesRes, staffRes, stusRes] = await Promise.all([
      leaveService.getLeaves(),
      teacherService.getAll(),
      studentService.getAll(),
    ]);

    if (leavesRes.success && leavesRes.data) setLeaves(leavesRes.data);
    if (staffRes.success && staffRes.data) {
      const staffArr = staffRes.data;
      setStaffList(staffArr);
      if (staffArr.length > 0) setFormData((prev) => ({ ...prev, staffId: staffArr[0].id }));
    }
    if (stusRes.success && stusRes.data) {
      const stusArr = stusRes.data;
      setStudents(stusArr);
      if (stusArr.length > 0) setFormData((prev) => ({ ...prev, studentId: stusArr[0].id }));
    }
    setLoading(false);
  };

  const fetchLeaves = async () => {
    setLoading(true);
    const res = await leaveService.getLeaves({ status: statusFilter, applicantType: typeFilter });
    if (res.success && res.data) setLeaves(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, typeFilter]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await leaveService.applyLeave(formData);
    if (res.success && res.data) {
      setSuccessMsg("Leave application submitted successfully for Principal approval.");
      setIsApplyOpen(false);
      fetchLeaves();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Submission failed");
    }
    setSubmitting(false);
  };

  const handleOpenAction = (leave: LeaveApplication, status: "Approved" | "Rejected") => {
    setSelectedLeave(leave);
    setActionType(status);
    setActionRemarks(status === "Approved" ? "Sanctioned by Principal" : "Not recommended due to academic schedule");
    setIsActionOpen(true);
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setSubmitting(true);
    const res = await leaveService.updateStatus(selectedLeave.id, actionType, actionRemarks);
    if (res.success) {
      setSuccessMsg(`Leave request marked as ${actionType}.`);
      setIsActionOpen(false);
      fetchLeaves();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Action failed");
    }
    setSubmitting(false);
  };

  // Metrics
  const totalApplications = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === "Pending").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "Rejected").length;

  return (
    <DashboardLayout
      title="Staff & Student Leave Approvals"
      subtitle="Formal leave applications, yearly quota monitoring, and Principal sanction register"
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Applications</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{totalApplications}</p>
            <p className="text-[11px] text-slate-500 mt-1">Submitted requests</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-0.5">{pendingCount}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Awaiting Principal action</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved Leaves</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">{approvedCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Sanctioned</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rejected</p>
            <p className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-0.5">{rejectedCount}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">Disapproved</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs mb-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5 w-full">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="all">All Approval Statuses</option>
            <option value="Pending">Pending Principal Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="all">All Applicants (Staff & Students)</option>
            <option value="Staff">Staff Applications</option>
            <option value="Student">Student Applications</option>
          </select>
        </div>

        <button
          onClick={() => setIsApplyOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Submit Leave Application
        </button>
      </div>

      {/* Leaves Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Ref No</th>
                <th className="py-3 px-4 whitespace-nowrap">Applicant</th>
                <th className="py-3 px-3 whitespace-nowrap">Role / Class</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Leave Type</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Dates (From - To)</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Days</th>
                <th className="py-3 px-4 whitespace-nowrap">Reason</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Principal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Loading applications...
                  </td>
                </tr>
              ) : leaves.length > 0 ? (
                leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                        #LV-{l.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                      {l.applicantType === "Staff" ? l.staff?.name : l.student?.name}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      {l.applicantType === "Staff" ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                          Staff ({l.staff?.designation})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                          Student ({l.student?.classSection?.name})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-800">
                      {l.leaveType} Leave
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-700">
                      {formatDate(l.startDate)} - {formatDate(l.endDate)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-center font-bold text-slate-900">
                      {l.days}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 max-w-xs truncate" title={l.reason}>
                      {l.reason}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          l.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : l.status === "Rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      {l.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAction(l, "Approved")}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenAction(l, "Rejected")}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {l.approvedBy ? `By: ${l.approvedBy}` : "Completed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No leave applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Submit Leave Application"
        description="Formal leave request for staff or student record"
        maxWidth="md"
      >
        <form onSubmit={handleApply} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Applicant Type *</label>
            <select
              value={formData.applicantType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  applicantType: e.target.value as "Staff" | "Student",
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
            >
              <option value="Staff">Faculty / Staff Member</option>
              <option value="Student">Enrolled Student</option>
            </select>
          </div>

          {formData.applicantType === "Staff" ? (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Staff Member *</label>
              <select
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.employeeNo} - {st.designation})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Student *</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {students.slice(0, 50).map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.name} ({stu.admissionNo} - {stu.classSection?.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Leave Type *</label>
              <select
                value={formData.leaveType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    leaveType: e.target.value as "Casual" | "Medical" | "Annual" | "Unpaid",
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="Casual">Casual Leave (Within Quota)</option>
                <option value="Medical">Medical Leave (Cert Required)</option>
                <option value="Annual">Annual Leave</option>
                <option value="Unpaid">Unpaid Leave (Salary Deduction)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Days *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">From Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">To Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Reason / Explanation *</label>
            <textarea
              required
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="State reason for leave application"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsApplyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} size="sm">
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* Principal Action Modal */}
      {selectedLeave && (
        <Modal
          isOpen={isActionOpen}
          onClose={() => setIsActionOpen(false)}
          title={`Principal Action: ${actionType} Leave`}
          description={`Application by ${selectedLeave.applicantType === "Staff" ? selectedLeave.staff?.name : selectedLeave.student?.name} for ${selectedLeave.days} day(s)`}
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmAction} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Principal Remarks / Sanction Order *</label>
              <input
                type="text"
                required
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsActionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} size="sm" variant={actionType === "Approved" ? "primary" : "danger"}>
                Confirm {actionType}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
