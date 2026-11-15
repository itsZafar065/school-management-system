"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { feeService } from "@/services/feeService";
import { classService } from "@/services/classService";
import { settingsService } from "@/services/settingsService";
import { FeeChallan, ClassItem, SchoolSetting } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatPKR, formatDate } from "@/lib/formatters";

export default function FeesPage() {
  const [challans, setChallans] = useState<FeeChallan[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [setting, setSetting] = useState<SchoolSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tabs: 'challans' | 'defaulters' | 'reports'
  const [activeTab, setActiveTab] = useState<"challans" | "defaulters" | "reports">("challans");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isPrintChallanOpen, setIsPrintChallanOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<FeeChallan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Generate form
  const [generateClassId, setGenerateClassId] = useState("all");
  const [generateMonth, setGenerateMonth] = useState("2026-03");
  const [issueDate, setIssueDate] = useState("2026-03-01");
  const [dueDate, setDueDate] = useState("2026-03-10");
  const [otherCharges, setOtherCharges] = useState(0);
  const [otherChargesTitle, setOtherChargesTitle] = useState("");

  // Pay form
  const [payAmount, setPayAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [bankName, setBankName] = useState("Meezan Bank Ltd (Johar Town Branch)");
  const [payRemarks, setPayRemarks] = useState("");

  // Reports data
  const [reportsData, setReportsData] = useState<{
    summary: { totalBilled: number; totalCollected: number; totalOutstanding: number };
    classWise: { name: string; billed: number; collected: number; balance: number }[];
    monthWise: { month: string; billed: number; collected: number; balance: number }[];
  } | null>(null);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    const [classesRes, setRes] = await Promise.all([
      classService.getAll(),
      settingsService.getSettings(),
    ]);
    if (classesRes.success && classesRes.data) setClasses(classesRes.data);
    if (setRes.success && setRes.data) setSetting(setRes.data);
    await fetchChallans();
    setLoading(false);
  };

  const fetchChallans = async () => {
    setLoading(true);
    if (activeTab === "defaulters") {
      const res = await feeService.getDefaulters(selectedClassId);
      if (res.success && res.data) setChallans(res.data);
    } else if (activeTab === "reports") {
      const res = await feeService.getReports();
      if (res.success && res.data) setReportsData(res.data);
    } else {
      const res = await feeService.getChallans({
        month: selectedMonth,
        classSectionId: selectedClassId,
        status: selectedStatus,
        search,
      });
      if (res.success && res.data) setChallans(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChallans();
  }, [activeTab, selectedMonth, selectedClassId, selectedStatus, search]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await feeService.generateChallans({
      classSectionId: generateClassId,
      month: generateMonth,
      issueDate,
      dueDate,
      otherCharges,
      otherChargesTitle,
    });

    if (res.success && res.data) {
      setSuccessMsg(`Generated ${res.data.count} monthly fee challans for ${res.data.month}!`);
      setIsGenerateOpen(false);
      fetchChallans();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Challan generation failed.");
    }
    setSubmitting(false);
  };

  const handleOpenPay = (challan: FeeChallan) => {
    setSelectedChallan(challan);
    setPayAmount(challan.balance);
    setPaymentMethod("Cash");
    setBankName("Meezan Bank Ltd (Johar Town Branch)");
    setPayRemarks("");
    setIsPayOpen(true);
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallan) return;
    setSubmitting(true);
    setError(null);

    const res = await feeService.payChallan(selectedChallan.id, {
      amount: payAmount,
      paymentMethod,
      bankName: paymentMethod === "Bank" ? bankName : undefined,
      remarks: payRemarks,
    });

    if (res.success) {
      setSuccessMsg(`Payment of ${formatPKR(payAmount)} recorded successfully!`);
      setIsPayOpen(false);
      fetchChallans();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Payment recording failed.");
    }
    setSubmitting(false);
  };

  const handleOpenPrint = (challan: FeeChallan) => {
    setSelectedChallan(challan);
    setIsPrintChallanOpen(true);
  };

  // Quick summary stats for KPI cards
  const totalBilled = challans.reduce((acc, c) => acc + (c.totalPayable || 0), 0);
  const totalCollected = challans.reduce((acc, c) => acc + (c.paidAmount || 0), 0);
  const totalOutstanding = challans.reduce((acc, c) => acc + (c.balance || 0), 0);
  const unpaidCount = challans.filter((c) => c.status !== "Paid").length;

  return (
    <DashboardLayout
      title="Fee Management & Accounts"
      subtitle="Monthly fee challans, 3-copy A4 printouts, payment ledger, and collection reports"
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

      {/* Financial Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Billed</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{formatPKR(totalBilled)}</p>
            <p className="text-[11px] text-slate-500 mt-1">{challans.length} Challans issued</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-lg font-bold">
            Rs
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fee Collected</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">{formatPKR(totalCollected)}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Realized revenue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-lg font-bold">
            ✓
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Arrears / Balance</p>
            <p className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-0.5">{formatPKR(totalOutstanding)}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">Pending recovery</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 text-lg font-bold">
            !
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Challans</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-0.5">{unpaidCount}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Unpaid / Partial</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 text-lg font-bold">
            ⌛
          </div>
        </div>
      </div>

      {/* Segmented Pill Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-4 max-w-fit">
        <button
          onClick={() => setActiveTab("challans")}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeTab === "challans"
              ? "bg-white text-blue-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Monthly Challans Register
        </button>
        <button
          onClick={() => setActiveTab("defaulters")}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeTab === "defaulters"
              ? "bg-white text-blue-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Fee Defaulters & Arrears
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeTab === "reports"
              ? "bg-white text-blue-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Collection Reports & Cash Closing
        </button>
      </div>

      {/* Sub-bar / Filters */}
      {activeTab !== "reports" && (
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs mb-4 flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5 w-full">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search challan, student, roll..."
                className="w-full pl-3 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {activeTab === "challans" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="2026-03">March 2026</option>
                <option value="2026-02">February 2026</option>
                <option value="2026-01">January 2026</option>
                <option value="all">All Months</option>
              </select>
            )}

            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section})
                </option>
              ))}
            </select>

            {activeTab === "challans" && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial Paid</option>
                <option value="Paid">Paid</option>
              </select>
            )}
          </div>

          <button
            onClick={() => setIsGenerateOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            + Generate Challans (1-Click)
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === "reports" && reportsData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-center">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Total Fee Billed</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{formatPKR(reportsData.summary.totalBilled)}</p>
            </div>
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl shadow-xs text-center">
              <span className="text-[11px] text-emerald-800 uppercase font-bold tracking-wider">Total Collected</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatPKR(reportsData.summary.totalCollected)}</p>
            </div>
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl shadow-xs text-center">
              <span className="text-[11px] text-rose-800 uppercase font-bold tracking-wider">Outstanding Balance</span>
              <p className="text-2xl font-extrabold text-rose-700 mt-1">{formatPKR(reportsData.summary.totalOutstanding)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Class-Wise Fee Collection Summary
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3.5 text-left whitespace-nowrap">Class</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Billed</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Collected</th>
                      <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportsData.classWise.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3.5 font-semibold text-slate-900 whitespace-nowrap">{c.name}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">{formatPKR(c.billed)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">{formatPKR(c.collected)}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-rose-700 whitespace-nowrap">{formatPKR(c.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Month-Wise Collection & Cash Closing
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3.5 text-left whitespace-nowrap">Month</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Billed</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Collected</th>
                      <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportsData.monthWise.map((m) => (
                      <tr key={m.month} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3.5 font-semibold text-slate-900 whitespace-nowrap">{m.month}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">{formatPKR(m.billed)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">{formatPKR(m.collected)}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-rose-700 whitespace-nowrap">{formatPKR(m.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap">Challan No</th>
                  <th className="py-3 px-4 whitespace-nowrap">Student Particulars</th>
                  <th className="py-3 px-3 whitespace-nowrap">Class</th>
                  <th className="py-3 px-3 whitespace-nowrap">Month</th>
                  <th className="py-3 px-3 whitespace-nowrap">Due Date</th>
                  <th className="py-3 px-3 whitespace-nowrap text-right">Tuition</th>
                  <th className="py-3 px-3 whitespace-nowrap text-right">Arrears</th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-right">Total Payable</th>
                  <th className="py-3 px-3 whitespace-nowrap text-right">Paid</th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-right">Balance</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center">Status</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="py-10 text-center text-slate-500">
                      Loading fee records...
                    </td>
                  </tr>
                ) : challans.length > 0 ? (
                  challans.map((ch) => (
                    <tr key={ch.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                          {ch.challanNo}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs leading-snug">{ch.student?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {ch.student?.admissionNo} • Roll: {ch.student?.rollNo}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
                          {ch.classSection?.name} ({ch.classSection?.section})
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700 font-medium">{ch.month}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">{formatDate(ch.dueDate)}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-right text-slate-700 font-medium">{formatPKR(ch.tuitionFee)}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-right text-rose-600 font-mono font-semibold">
                        {ch.arrears > 0 ? formatPKR(ch.arrears) : "-"}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-right font-bold text-slate-900">{formatPKR(ch.totalPayable)}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-right text-emerald-700 font-semibold">{formatPKR(ch.paidAmount)}</td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-right text-rose-700 font-bold">{formatPKR(ch.balance)}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ch.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : ch.status === "Partial"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {ch.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ch.status !== "Paid" && (
                            <button
                              onClick={() => handleOpenPay(ch)}
                              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                            >
                              Receive Fee
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenPrint(ch)}
                            className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                          >
                            Print 3-Copy
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      No fee challans found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Challans Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="1-Click Bulk Monthly Challan Generation"
        description="Generates fee challans with automated tuition fee, student discount deduction, and arrears carried forward"
        maxWidth="md"
      >
        <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Class *</label>
            <select
              value={generateClassId}
              onChange={(e) => setGenerateClassId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="all">Whole School (All Classes)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section}) - Tuition: {formatPKR(c.tuitionFee)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Billing Month *</label>
              <input
                type="month"
                required
                value={generateMonth}
                onChange={(e) => setGenerateMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">One-Time / Event Charges (PKR)</label>
              <input
                type="number"
                value={otherCharges}
                onChange={(e) => setOtherCharges(parseInt(e.target.value) || 0)}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Event Title</label>
              <input
                type="text"
                value={otherChargesTitle}
                onChange={(e) => setOtherChargesTitle(e.target.value)}
                placeholder="e.g. Annual Sports / Tour"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Automated Policies Applied:</strong> Sibling discounts (20%) and staff child concessions are deducted automatically. Unpaid balances from previous months will be added as Arrears.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} size="sm">
              Generate Challans
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pay Challan Modal */}
      {selectedChallan && (
        <Modal
          isOpen={isPayOpen}
          onClose={() => setIsPayOpen(false)}
          title={`Receive Fee Payment: ${selectedChallan.challanNo}`}
          description={`Student: ${selectedChallan.student?.name} (${selectedChallan.student?.admissionNo}) • Total Balance: ${formatPKR(selectedChallan.balance)}`}
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmPay} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Amount (PKR) *</label>
              <input
                type="number"
                required
                max={selectedChallan.balance}
                min={1}
                value={payAmount}
                onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="Cash">Cash at School Counter</option>
                <option value="Bank">Bank Deposit / Online Transfer</option>
              </select>
            </div>

            {paymentMethod === "Bank" && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bank Name / Branch</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Remarks / Receipt Note</label>
              <input
                type="text"
                value={payRemarks}
                onChange={(e) => setPayRemarks(e.target.value)}
                placeholder="e.g. Paid in full by father"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPayOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} size="sm">
                Record Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable 3-Copy Challan (A4) Modal */}
      {selectedChallan && isPrintChallanOpen && (
        <Modal
          isOpen={isPrintChallanOpen}
          onClose={() => setIsPrintChallanOpen(false)}
          title={`Printable Fee Challan: ${selectedChallan.challanNo}`}
          maxWidth="4xl"
        >
          <div className="print:m-0 print:p-0">
            <div className="flex justify-end mb-3 print:hidden">
              <Button size="sm" onClick={() => window.print()}>
                Print 3-Copy Challan (A4)
              </Button>
            </div>

            {/* 3 Columns on Single A4 Sheet */}
            <div className="border border-black p-4 bg-white text-black font-serif text-[10px] leading-tight max-w-[297mm] mx-auto print:border-none print:p-0">
              <div className="grid grid-cols-3 divide-x-2 divide-dashed divide-black">
                {["BANK COPY", "SCHOOL COPY", "STUDENT COPY"].map((copyType) => (
                  <div key={copyType} className="px-3">
                    <div className="text-center border-b border-black pb-2 mb-2">
                      <h4 className="font-bold text-xs uppercase leading-tight">{setting?.schoolName}</h4>
                      <p className="text-[9px]">{setting?.address}</p>
                      <p className="text-[9px]">Ph: {setting?.phone} • Reg: {setting?.regNo}</p>
                      <div className="mt-1 font-bold border border-black inline-block px-2 py-0.5 uppercase bg-zinc-100 text-[9px]">
                        {copyType}
                      </div>
                    </div>

                    <div className="space-y-1 mb-2 border-b border-black pb-2 text-[10px]">
                      <div><strong>Challan No:</strong> {selectedChallan.challanNo}</div>
                      <div><strong>Admission No:</strong> {selectedChallan.student?.admissionNo}</div>
                      <div><strong>Student Name:</strong> {selectedChallan.student?.name}</div>
                      <div><strong>Father Name:</strong> {selectedChallan.student?.fatherName}</div>
                      <div><strong>Class:</strong> {selectedChallan.classSection?.name} ({selectedChallan.classSection?.section})</div>
                      <div><strong>Billing Month:</strong> {selectedChallan.month}</div>
                      <div><strong>Issue Date:</strong> {formatDate(selectedChallan.issueDate)}</div>
                      <div className="text-red-700 font-bold"><strong>Due Date:</strong> {formatDate(selectedChallan.dueDate)}</div>
                    </div>

                    <table className="w-full text-[10px] border-collapse mb-2">
                      <thead>
                        <tr className="border-b border-black">
                          <th className="py-1 text-left">Fee Head</th>
                          <th className="py-1 text-right">Amount (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-300">
                        <tr>
                          <td className="py-0.5">Tuition Fee</td>
                          <td className="py-0.5 text-right">{formatPKR(selectedChallan.tuitionFee)}</td>
                        </tr>
                        {selectedChallan.annualFund > 0 && (
                          <tr>
                            <td className="py-0.5">Annual Fund</td>
                            <td className="py-0.5 text-right">{formatPKR(selectedChallan.annualFund)}</td>
                          </tr>
                        )}
                        {selectedChallan.examFee > 0 && (
                          <tr>
                            <td className="py-0.5">Examination Fee</td>
                            <td className="py-0.5 text-right">{formatPKR(selectedChallan.examFee)}</td>
                          </tr>
                        )}
                        {selectedChallan.otherCharges > 0 && (
                          <tr>
                            <td className="py-0.5">{selectedChallan.otherChargesTitle || "Other Charges"}</td>
                            <td className="py-0.5 text-right">{formatPKR(selectedChallan.otherCharges)}</td>
                          </tr>
                        )}
                        {selectedChallan.discount > 0 && (
                          <tr className="text-emerald-700 font-semibold">
                            <td className="py-0.5">Fee Concession</td>
                            <td className="py-0.5 text-right">-{formatPKR(selectedChallan.discount)}</td>
                          </tr>
                        )}
                        {selectedChallan.arrears > 0 && (
                          <tr className="text-red-700 font-bold">
                            <td className="py-0.5">Previous Arrears</td>
                            <td className="py-0.5 text-right">{formatPKR(selectedChallan.arrears)}</td>
                          </tr>
                        )}
                        <tr className="border-t-2 border-black font-bold">
                          <td className="py-1">Total Payable</td>
                          <td className="py-1 text-right">{formatPKR(selectedChallan.totalPayable)}</td>
                        </tr>
                        <tr className="text-red-700">
                          <td className="py-0.5">Late Fine (After Due Date)</td>
                          <td className="py-0.5 text-right">Rs. {setting?.lateFinePerDay || 50}/day</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="text-[9px] border border-black p-1 mb-4">
                      <strong>Payment Bank:</strong> Meezan Bank Ltd (A/C: 0102-0103445566)<br />
                      Cash deposit accepted at bank or school accounts counter.
                    </div>

                    <div className="grid grid-cols-2 text-center pt-8 text-[9px]">
                      <div>
                        <div className="border-t border-black mx-2 pt-0.5">Bank Cashier / Clerk</div>
                      </div>
                      <div>
                        <div className="border-t border-black mx-2 pt-0.5">Accountant Stamp</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
