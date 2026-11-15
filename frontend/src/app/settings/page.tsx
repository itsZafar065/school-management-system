"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { settingsService } from "@/services/settingsService";
import { SchoolSetting } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  School,
  Clock,
  SlidersHorizontal,
  Save,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function SettingsPage() {
  const [formData, setFormData] = useState<Partial<SchoolSetting>>({
    schoolName: "Al-Ilm Public High School",
    schoolUrduName: "العلم پبلک ہائی اسکول",
    regNo: "REG-LHR-2014-8842",
    logoUrl: "",
    address: "Street 4, Sector B-1, Johar Town, Lahore",
    phone: "042-35123456",
    mobile: "0300-1234567",
    email: "info@alilm.edu.pk",
    principalName: "Prof. Muhammad Tariq Mehmood",
    sessionYear: "2025-2026",
    schoolStartTime: "08:00",
    lateGraceMinutes: 15,
    lateFinePerDay: 50,
    lateRuleDays: 3,
    casualLeaveQuota: 10,
    medicalLeaveQuota: 8,
    annualLeaveQuota: 10,
    workingDaysPerMonth: 26,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    settingsService.getSettings().then((res) => {
      if (res.success && res.data) {
        setFormData(res.data);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await settingsService.updateSettings(formData);
    if (res.success) {
      setSuccessMsg("School information and operational rules updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Update failed");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="School Settings" subtitle="Loading configurations...">
        <div className="py-8 text-center text-zinc-500 text-xs">Loading settings...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="School Settings & Operational Rules"
      subtitle="School institutional information, official contact numbers, start times, and automated deduction rules"
    >
      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 font-bold text-sm">×</button>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between shadow-xs max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 font-bold text-sm">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl font-sans text-xs">
        {/* Section 1: Institution Info */}
        <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                1. Official School Profile & Printout Header
              </h3>
              <p className="text-[11px] text-slate-400">Institutional brand data displayed on sidebar, login, challans and report cards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">School Name (English) *</label>
              <input
                type="text"
                required
                value={formData.schoolName || ""}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">School Name (Urdu)</label>
              <input
                type="text"
                value={formData.schoolUrduName || ""}
                onChange={(e) => setFormData({ ...formData, schoolUrduName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-urdu focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Govt Registration / BISE Code *</label>
              <input
                type="text"
                required
                value={formData.regNo || ""}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Principal / Head of School *</label>
              <input
                type="text"
                required
                value={formData.principalName || ""}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Current Academic Session *</label>
              <input
                type="text"
                required
                value={formData.sessionYear || ""}
                onChange={(e) => setFormData({ ...formData, sessionYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official PTCL / Landline *</label>
              <input
                type="text"
                required
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Mobile / WhatsApp</label>
              <input
                type="text"
                value={formData.mobile || ""}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Campus Address *</label>
              <input
                type="text"
                required
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Timing, Punctuality & Late Deduction Rules */}
        <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                2. School Timings & Automated Payroll Deduction Rules
              </h3>
              <p className="text-[11px] text-slate-400">Punctuality parameters applied directly to staff attendance check-ins and monthly salary deductions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">School Start Time (24H) *</label>
              <input
                type="text"
                required
                value={formData.schoolStartTime || "08:00"}
                onChange={(e) => setFormData({ ...formData, schoolStartTime: e.target.value })}
                placeholder="08:00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Late Grace (Minutes) *</label>
              <input
                type="number"
                min={0}
                value={formData.lateGraceMinutes ?? 15}
                onChange={(e) => setFormData({ ...formData, lateGraceMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Late Rule (Lates = 1 Day Cut) *</label>
              <input
                type="number"
                min={1}
                value={formData.lateRuleDays ?? 3}
                onChange={(e) => setFormData({ ...formData, lateRuleDays: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Working Days in Month *</label>
              <input
                type="number"
                min={20}
                max={31}
                value={formData.workingDaysPerMonth ?? 26}
                onChange={(e) => setFormData({ ...formData, workingDaysPerMonth: parseInt(e.target.value) || 26 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fee Late Fine (Rs/day)</label>
              <input
                type="number"
                value={formData.lateFinePerDay ?? 50}
                onChange={(e) => setFormData({ ...formData, lateFinePerDay: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Staff Casual Leave Quota</label>
              <input
                type="number"
                value={formData.casualLeaveQuota ?? 10}
                onChange={(e) => setFormData({ ...formData, casualLeaveQuota: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Staff Medical Leave Quota</label>
              <input
                type="number"
                value={formData.medicalLeaveQuota ?? 8}
                onChange={(e) => setFormData({ ...formData, medicalLeaveQuota: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Staff Annual Leave Quota</label>
              <input
                type="number"
                value={formData.annualLeaveQuota ?? 10}
                onChange={(e) => setFormData({ ...formData, annualLeaveQuota: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save System Configurations"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
