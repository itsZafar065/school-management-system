"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { attendanceService } from "@/services/attendanceService";
import { settingsService } from "@/services/settingsService";
import { StaffAttendance, SchoolSetting } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/formatters";
import {
  Clock,
  UserCheck,
  UserX,
  Users,
  CheckCircle,
  AlertCircle,
  Save,
  ShieldAlert,
} from "lucide-react";

export default function StaffAttendancePage() {
  const [records, setRecords] = useState<StaffAttendance[]>([]);
  const [setting, setSetting] = useState<SchoolSetting | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    settingsService.getSettings().then((res) => {
      if (res.success && res.data) setSetting(res.data);
    });
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    setError(null);
    const res = await attendanceService.getStaffAttendance(selectedDate);
    if (res.success && res.data) {
      setRecords(res.data.records);
    } else {
      setError(res.error || "Failed to load staff attendance.");
    }
    setLoading(false);
  };

  const handleQuickCheckIn = async (staffId: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const res = await attendanceService.staffCheckIn(staffId, timeStr, selectedDate);
    if (res.success) {
      setSuccessMsg(res.message || "Staff checked in successfully");
      loadAttendance();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Check-in failed");
    }
  };

  const handleStatusChange = (staffId: number, status: "Present" | "Absent" | "Leave" | "HalfDay") => {
    setRecords((prev) =>
      prev.map((r) => (r.staffId === staffId ? { ...r, status } : r))
    );
  };

  const handleSaveBulk = async () => {
    setSaving(true);
    setError(null);
    const payload = {
      date: selectedDate,
      records: records.map((r) => ({
        staffId: r.staffId,
        checkInTime: r.checkInTime,
        isLate: r.isLate,
        status: r.status,
      })),
    };
    const res = await attendanceService.markStaffAttendance(payload);
    if (res.success) {
      setSuccessMsg(`Staff attendance for ${formatDate(selectedDate)} saved successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Save failed");
    }
    setSaving(false);
  };

  const presentCount = records.filter((r) => r.status === "Present").length;
  const lateCount = records.filter((r) => r.isLate).length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const leaveCount = records.filter((r) => r.status === "Leave").length;

  return (
    <DashboardLayout
      title="Staff Attendance & Punctuality Register"
      subtitle="Staff check-in time, automated late detection from school start time, and leave records"
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

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Staff</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{records.length} Staff</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Faculty & Support</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Present Today</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{presentCount} Staff</div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">On school premises</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Late Arrivals</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{lateCount} Staff</div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">After {setting?.schoolStartTime || "08:00 AM"}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Absent / On Leave</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{absentCount + leaveCount} Staff</div>
            <div className="text-[10px] text-rose-600/80 mt-0.5">Excused & Unexcused</div>
          </div>
        </div>
      </div>

      {/* Top Bar: Date + Policy Info + Save */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-center gap-3.5 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="p-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              School Opening Bell: <strong className="text-slate-900 font-mono">{setting?.schoolStartTime || "08:00 AM"}</strong>. Check-in after this bell is automatically tagged as <span className="font-bold text-amber-700">LATE</span> for salary calculations.
            </span>
          </div>
        </div>

        <Button
          onClick={handleSaveBulk}
          loading={saving}
          icon={<Save className="w-4 h-4" />}
          className="w-full sm:w-auto shrink-0 shadow-sm shadow-blue-600/30"
        >
          Save Register
        </Button>
      </div>

      {/* Staff Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-800">Staff Attendance & Punctuality Sheet</span>
            <span className="text-[11px] text-slate-500 font-mono">({records.length} employees)</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Date: <span className="font-bold text-slate-800">{formatDate(selectedDate)}</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Emp No</th>
                <th className="py-3 px-4 whitespace-nowrap">Staff Name</th>
                <th className="py-3 px-4 whitespace-nowrap">Designation</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Check-In Time</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Punctuality Flag</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">Attendance Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading staff attendance...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.staffId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                        {r.employeeNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">{r.name}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">{r.designation}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono">
                      {r.checkInTime ? (
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {r.checkInTime} AM
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Checked In</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      {r.isLate ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                          LATE
                        </span>
                      ) : r.checkInTime ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                          ON TIME
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleStatusChange(
                            r.staffId,
                            e.target.value as "Present" | "Absent" | "Leave" | "HalfDay"
                          )
                        }
                        className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">Approved Leave</option>
                        <option value="HalfDay">Half Day</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      {!r.checkInTime && (
                        <button
                          onClick={() => handleQuickCheckIn(r.staffId)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Check In Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No staff records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
