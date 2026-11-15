"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { dashboardService } from "@/services/dashboardService";
import { DashboardStats } from "@/types";
import { formatPKR, formatDate } from "@/lib/formatters";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  ArrowUpRight,
  FileText,
  Clock,
  Receipt,
  UserCheck,
  AlertCircle,
  Building,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService.getStats().then((res) => {
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.error || "Failed to load dashboard data.");
      }
      setLoading(false);
    });
  }, []);

  const role = stats?.role || "Admin";

  return (
    <DashboardLayout
      title={`${role} Executive Dashboard`}
      subtitle="Institutional operations, real-time student attendance, fee collections, and staff ledger"
    >
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {loading ? "..." : stats?.overview.totalStudents ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Active in register</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Teaching Faculty */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Staff & Faculty
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {loading ? "..." : stats?.overview.totalTeachers ?? 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {stats?.overview.staffPresent ?? 0} Present Today
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Student Attendance Rate */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Attendance Today
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {loading ? "..." : `${stats?.overview.studentAttendancePct ?? 0}%`}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {stats?.attendanceToday.present ?? 0} Present / {stats?.attendanceToday.absent ?? 0} Absent
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Total Fee Collected */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Fee Collections
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 truncate">
              {loading ? "..." : formatPKR(stats?.overview.feeCollected)}
            </div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5 truncate">
              Arrears: {formatPKR(stats?.overview.feeOutstanding)}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Middle Row: Attendance Breakdown & Operational Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Summary */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daily Student Punctuality & Attendance
              </h3>
              <p className="text-[11px] text-slate-500">
                School Opening Time: <span className="font-semibold text-slate-700">{stats?.setting?.schoolStartTime || "08:00 AM"}</span>
              </p>
            </div>
            <Link
              href="/attendance"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              <span>Attendance Sheet</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl mb-4">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Present</span>
              <span className="text-xl font-bold text-emerald-600">
                {stats?.attendanceToday.present ?? 0}
              </span>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">Absent</span>
              <span className="text-xl font-bold text-rose-600">
                {stats?.attendanceToday.absent ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Late Arrival</span>
              <span className="text-xl font-bold text-amber-600">
                {stats?.attendanceToday.late ?? 0}
              </span>
            </div>
          </div>

          {/* Class Distribution Grid */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Class Capacities & Monthly Fees</span>
              <Link href="/classes" className="text-blue-600 hover:underline normal-case text-xs font-normal">
                View all classes
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {stats?.classDistribution.slice(0, 6).map((c) => (
                <div key={c.name} className="p-3 border border-slate-200/80 rounded-xl bg-slate-50/50 text-[11px] hover:border-blue-300 transition-colors">
                  <div className="font-bold text-slate-800 text-xs">{c.name}</div>
                  <div className="text-slate-600 mt-0.5">
                    {c.count} / {c.capacity} Students
                  </div>
                  <div className="text-emerald-700 font-semibold text-[10px] mt-1">
                    {formatPKR(c.tuitionFee)}/mo
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Office Operations Panel */}
        <div className="p-5 bg-white border border-slate-200/90 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 mb-3.5">
              Quick Office Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/students"
                className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl hover:bg-blue-50/50 hover:border-blue-300 transition-all group"
              >
                <div>
                  <div className="font-bold text-slate-800 text-xs group-hover:text-blue-700">New Admission (A4)</div>
                  <div className="text-[11px] text-slate-400">B-Form, bio-data & printable form</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/fees"
                className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl hover:bg-blue-50/50 hover:border-blue-300 transition-all group"
              >
                <div>
                  <div className="font-bold text-slate-800 text-xs group-hover:text-blue-700">3-Copy Fee Challan</div>
                  <div className="text-[11px] text-slate-400">Bank, School & Student copies</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/payroll"
                className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl hover:bg-blue-50/50 hover:border-blue-300 transition-all group"
              >
                <div>
                  <div className="font-bold text-slate-800 text-xs group-hover:text-blue-700">Staff Payroll Register</div>
                  <div className="text-[11px] text-slate-400">Late & absent auto-deduction cuts</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/exams"
                className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl hover:bg-blue-50/50 hover:border-blue-300 transition-all group"
              >
                <div>
                  <div className="font-bold text-slate-800 text-xs group-hover:text-blue-700">Exam Report Cards</div>
                  <div className="text-[11px] text-slate-400">Marks gazette & printable cards</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pending Leave Requests:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
              {stats?.overview.pendingLeaves ?? 0} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Recent Admissions Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recent Admissions in Lifetime Register
            </h3>
          </div>
          <Link href="/students" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
            View All Register →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Admission No</th>
                <th className="py-3 px-4 whitespace-nowrap">Student Name</th>
                <th className="py-3 px-4 whitespace-nowrap">Father Name</th>
                <th className="py-3 px-4 whitespace-nowrap">Father CNIC</th>
                <th className="py-3 px-4 whitespace-nowrap">Class & Section</th>
                <th className="py-3 px-4 whitespace-nowrap">Admission Date</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentStudents && stats.recentStudents.length > 0 ? (
                stats.recentStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-blue-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                        {s.admissionNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {s.fatherName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                      {s.fatherCnic}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs">
                        {s.classSection?.name} ({s.classSection?.section})
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono">
                      {formatDate(s.admissionDate)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No recent student records found.
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
