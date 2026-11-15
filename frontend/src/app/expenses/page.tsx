"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { expenseService } from "@/services/expenseService";
import { Expense } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPKR, formatDate } from "@/lib/formatters";
import {
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
  Plus,
  Building,
  CreditCard,
} from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [reportData, setReportData] = useState<{
    feeIncome: number;
    operationalExpenses: number;
    salaryExpenses: number;
    totalOutflow: number;
    netProfit: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("2026-03");

  // Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    title: "",
    category: "Utility" as "Utility" | "Maintenance" | "Supplies" | "Salary" | "Event" | "Other",
    amount: 5000,
    date: new Date().toISOString().split("T")[0],
    paidTo: "",
    paymentMethod: "Cash",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    const [expRes, repRes] = await Promise.all([
      expenseService.getExpenses({ category: selectedCategory, month: selectedMonth }),
      expenseService.getIncomeExpenseReport(),
    ]);

    if (expRes.success && expRes.data) {
      setExpenses(expRes.data.expenses);
      setTotalExpense(expRes.data.total);
    }
    if (repRes.success && repRes.data) {
      setReportData(repRes.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await expenseService.createExpense(formData);
    if (res.success && res.data) {
      setSuccessMsg(`Expense voucher for ${res.data.title} recorded successfully!`);
      setIsAddOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Expense recording failed");
    }
    setSubmitting(false);
  };

  return (
    <DashboardLayout
      title="School Expenses & Profit Statement"
      subtitle="Operational expenditure, utility bills, maintenance vouchers, and income vs outflow report"
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

      {/* Financial Statement Executive Cards */}
      {reportData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Fee Income</p>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">{formatPKR(reportData.feeIncome)}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Student fees received</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Staff Salaries Paid</p>
              <p className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-0.5">{formatPKR(reportData.salaryExpenses)}</p>
              <p className="text-[11px] text-rose-500 font-medium mt-1">Monthly payroll outflow</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operational Expenses</p>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-0.5">{formatPKR(reportData.operationalExpenses)}</p>
              <p className="text-[11px] text-amber-600 font-medium mt-1">Bills, supplies & repairs</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border shadow-xs flex items-center justify-between ${
            reportData.netProfit >= 0 ? "bg-white border-slate-200" : "bg-rose-50/50 border-rose-200"
          }`}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Operating Surplus</p>
              <p className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${
                reportData.netProfit >= 0 ? "text-blue-700" : "text-rose-700"
              }`}>
                {formatPKR(reportData.netProfit)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Income less all expenses</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              reportData.netProfit >= 0 ? "bg-blue-50 border border-blue-100 text-blue-600" : "bg-rose-100 text-rose-700"
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs mb-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5 w-full">
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

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="all">All Expense Categories</option>
            <option value="Utility">Utility Bills (Electricity/Gas/Water)</option>
            <option value="Supplies">Printing & Office Supplies</option>
            <option value="Maintenance">Generator & Building Maintenance</option>
            <option value="Event">Functions & Sports Events</option>
            <option value="Other">Other Expenses</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Expense Voucher
        </button>
      </div>

      {/* Expense Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Expense Vouchers ({selectedMonth})
          </h3>
          <span className="font-bold text-xs text-rose-700">
            Total Billed: {formatPKR(totalExpense)}
          </span>
        </div>
        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Voucher #</th>
                <th className="py-3 px-4 whitespace-nowrap">Expense Title</th>
                <th className="py-3 px-3 whitespace-nowrap">Category</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Paid To (Vendor)</th>
                <th className="py-3 px-3 whitespace-nowrap">Method</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading vouchers...
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                        #EXP-{e.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-xs">{e.title}</div>
                      {e.description && <div className="text-[11px] text-slate-400 font-sans">{e.description}</div>}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-medium">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-700">{formatDate(e.date)}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">{e.paidTo}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px]">
                        {e.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right font-bold text-slate-900 font-mono">
                      {formatPKR(e.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No expense vouchers recorded for selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Expense Voucher"
        description="Record vendor payment, utility bill or supplies invoice"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Expense Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Science Lab Chemical Refill"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as "Utility" | "Maintenance" | "Supplies" | "Salary" | "Event" | "Other",
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
              >
                <option value="Utility">Utility Bills (Electricity/Gas)</option>
                <option value="Supplies">Stationery & Paper Supplies</option>
                <option value="Maintenance">Generator & Repairs</option>
                <option value="Event">School Function / Sports</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Amount (PKR) *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Paid To (Vendor Name) *</label>
              <input
                type="text"
                required
                value={formData.paidTo}
                onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                placeholder="e.g. LESCO / Urdu Bazaar Stationers"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="Cash">Cash Voucher</option>
              <option value="Cheque">Bank Cheque</option>
              <option value="Online">Online Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description / Notes</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 50 reams paper for mid-term exams"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} size="sm">
              Save Expense Voucher
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
