"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { backupService } from "@/services/backupService";
import { AuditLog } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  Database,
  Download,
  ShieldCheck,
  History,
  HardDrive,
  CheckCircle2,
} from "lucide-react";

export default function BackupPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backupService.getAuditLogs().then((res) => {
      if (res.success && res.data) setLogs(res.data);
      setLoading(false);
    });
  }, []);

  const handleDownloadBackup = () => {
    const url = backupService.getDownloadUrl();
    window.open(url, "_blank");
  };

  return (
    <DashboardLayout
      title="Database Backup & System Audit Trail"
      subtitle="One-click full SQLite database archive download and immutable system modification audit trail"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Database Engine</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">SQLite</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">WAL Journal Active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data Durability</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">Persistent</p>
            <p className="text-[11px] text-slate-500 mt-1">dev.db on disk</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Audit Actions</p>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-0.5">{logs.length}</p>
            <p className="text-[11px] text-purple-600 font-medium mt-1">Logged system events</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Backup Status</p>
            <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-0.5">Ready</p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">Instant 1-click download</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Backup Card */}
      <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs mb-6 max-w-2xl">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              1-Click Live Database Backup (.db Archive)
            </h3>
            <p className="text-[11px] text-slate-400">Direct export of full relational store</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Downloads the live SQLite database file containing all permanent student lifetime registers, attendance, challans, exam marks, and payroll records. Can be restored or inspected with any SQLite / PostgreSQL migration tool.
        </p>
        <button
          onClick={handleDownloadBackup}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download SQLite Database Backup
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            System Modification Audit Trail (Last 100 Actions)
          </h3>
          <span className="text-slate-500 text-[11px] font-medium">Audit Compliant Record</span>
        </div>

        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-3 whitespace-nowrap">Module</th>
                <th className="py-3 px-3 whitespace-nowrap">Action</th>
                <th className="py-3 px-3 whitespace-nowrap">Reference</th>
                <th className="py-3 px-4 whitespace-nowrap">Modification Details</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading audit trail...</td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">{log.module}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{log.recordId || "-"}</td>
                    <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">{log.details}</td>
                    <td className="py-2.5 px-3.5 font-medium text-slate-900 whitespace-nowrap">{log.performedBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No audit records recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
