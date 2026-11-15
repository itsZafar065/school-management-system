"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { attendanceService } from "@/services/attendanceService";
import { classService } from "@/services/classService";
import { studentService } from "@/services/studentService";
import { ClassItem, Student } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  Save,
  Clock,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

interface LocalAttendanceItem {
  studentId: number;
  classSectionId?: number;
  name: string;
  roll: string;
  class: string;
  status: "Present" | "Absent" | "Late";
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("1");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [records, setRecords] = useState<LocalAttendanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    classService.getAll().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setClasses(res.data);
        setSelectedClassId(String(res.data[0].id));
        setSelectedClass(res.data[0].name);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadAttendanceData();
    }
  }, [selectedClassId, selectedDate]);

  const loadAttendanceData = async () => {
    setLoading(true);
    setError(null);

    const classIdNum = parseInt(selectedClassId) || 1;
    const activeClassObj = classes.find((c) => c.id === classIdNum);

    const [studentsRes, attendanceRes] = await Promise.all([
      studentService.getAll({ classSectionId: classIdNum, status: "Active" }),
      attendanceService.getAttendance({ date: selectedDate, classSectionId: classIdNum }),
    ]);

    const studentList: Student[] = studentsRes.data || [];
    const existingRecs = attendanceRes.data?.records || [];

    const combined: LocalAttendanceItem[] = studentList.map((stu) => {
      const found = existingRecs.find((r) => r.studentId === stu.id);
      return {
        studentId: stu.id,
        classSectionId: stu.classSectionId || stu.classSection?.id || classIdNum,
        name: stu.name,
        roll: stu.rollNo || stu.roll || String(stu.id),
        class: stu.classSection?.name ? `${stu.classSection.name} (${stu.classSection.section})` : selectedClass,
        status: (found?.status as any) || "Present",
      };
    });

    setRecords(combined);
    setLoading(false);
  };

  const setStatus = (studentId: number, status: "Present" | "Absent" | "Late") => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleMarkAll = (status: "Present" | "Absent" | "Late") => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setError(null);

    const classIdNum = parseInt(selectedClassId) || 1;
    const activeClassObj = classes.find((c) => c.id === classIdNum);
    const payload = {
      date: selectedDate,
      classSectionId: classIdNum,
      records: records.map((r) => ({
        studentId: r.studentId,
        classSectionId: r.classSectionId || classIdNum,
        studentName: r.name,
        roll: r.roll,
        class: r.class,
        status: r.status,
      })),
    };

    const res = await attendanceService.markAttendance(payload);

    if (res.success) {
      setSuccessMsg(
        `Attendance for ${activeClassObj?.name || selectedClass} (${activeClassObj?.section || "A"}) on ${selectedDate} saved successfully!`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Failed to save attendance");
    }
    setSaving(false);
  };

  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const lateCount = records.filter((r) => r.status === "Late").length;
  const totalCount = records.length;
  const presentRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <DashboardLayout
      title="Student Daily Attendance Register"
      subtitle="Record, verify and monitor daily student attendance and punctuality for class sections"
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

      {/* 4 Attendance Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{totalCount} Students</div>
            <div className="text-[10px] text-slate-400 mt-0.5">In {selectedClass || "Class"}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Present Today</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{presentCount} Students</div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">{presentRate}% Attendance Rate</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Absent Students</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{absentCount} Students</div>
            <div className="text-[10px] text-rose-600/80 mt-0.5">Unexcused absence</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Late Arrivals</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{lateCount} Students</div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">Arrived after bell</div>
          </div>
        </div>
      </div>

      {/* Control bar: Date + Class Selector + Mark All shortcuts */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3.5 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          {/* Class Select */}
          <div className="w-full sm:w-56">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedClassId(id);
                const cls = classes.find((c) => String(c.id) === id);
                if (cls) setSelectedClass(cls.name);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="w-full sm:w-48">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Quick Mark Shortcuts */}
          <div className="w-full sm:w-auto pt-2 sm:pt-4 flex items-center gap-2">
            <button
              onClick={() => handleMarkAll("Present")}
              className="px-3 py-1.5 text-xs rounded-lg font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll("Absent")}
              className="px-3 py-1.5 text-xs rounded-lg font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="pt-2 sm:pt-4 w-full sm:w-auto">
          <Button
            onClick={handleSaveAttendance}
            loading={saving}
            icon={<Save className="w-4 h-4" />}
            className="w-full sm:w-auto shrink-0 shadow-sm shadow-blue-600/30"
          >
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-800">
              Class Attendance Register: {selectedClass}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">({records.length} students)</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Date: <span className="font-bold text-slate-800">{selectedDate}</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Roll No</th>
                <th className="py-3 px-5 whitespace-nowrap">Student Name</th>
                <th className="py-3 px-4 whitespace-nowrap">Class & Section</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Current Status</th>
                <th className="py-3 px-5 whitespace-nowrap text-right">Quick Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading attendance sheet...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.studentId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-700">
                      {r.roll}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap font-bold text-slate-900">
                      {r.name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                        {r.class}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.status === "Present"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status === "Absent"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap text-right">
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
                        <button
                          type="button"
                          onClick={() => setStatus(r.studentId, "Present")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            r.status === "Present"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(r.studentId, "Late")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            r.status === "Late"
                              ? "bg-amber-500 text-white shadow-xs"
                              : "text-slate-600 hover:text-amber-700 hover:bg-amber-50"
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(r.studentId, "Absent")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            r.status === "Absent"
                              ? "bg-rose-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-rose-700 hover:bg-rose-50"
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No students found for {selectedClass}.
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
