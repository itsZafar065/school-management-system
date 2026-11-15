"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { payrollService } from "@/services/payrollService";
import { settingsService } from "@/services/settingsService";
import { Payroll, SchoolSetting } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatPKR, formatDate } from "@/lib/formatters";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [setting, setSetting] = useState<SchoolSetting | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("2026-02");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isPrintSlipOpen, setIsPrintSlipOpen] = useState(false);
  const [isPrintSheetOpen, setIsPrintSheetOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Adjustment form
  const [bonus, setBonus] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [adjustRemarks, setAdjustRemarks] = useState("");

  useEffect(() => {
    loadPayroll();
  }, [selectedMonth]);

  const loadPayroll = async () => {
    setLoading(true);
    setError(null);
    const res = await payrollService.getPayrolls({ month: selectedMonth });
    if (res.success && res.data) {
      setPayrolls(res.data.payrolls);
      setSetting(res.data.setting);
    } else {
      setError(res.error || "Failed to load payroll.");
    }
    setLoading(false);
  };

  const handleGeneratePayroll = async () => {
    setSubmitting(true);
    setError(null);
    const res = await payrollService.generatePayroll(selectedMonth);
    if (res.success && res.data) {
      setSuccessMsg(`Monthly payroll calculated for ${res.data.count} employees for ${res.data.month}!`);
      loadPayroll();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(res.error || "Generation failed.");
    }
    setSubmitting(false);
  };

  const handleOpenAdjust = (p: Payroll) => {
    setSelectedPayroll(p);
    setBonus(p.bonus || 0);
    setOtherDeductions(p.otherDeductions || 0);
    setAdjustRemarks(p.remarks || "");
    setIsAdjustOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayroll) return;
    setSubmitting(true);
    const res = await payrollService.updatePayroll(selectedPayroll.id, {
      bonus,
      otherDeductions,
      remarks: adjustRemarks,
    });
    if (res.success) {
      setSuccessMsg(`Salary adjusted for ${selectedPayroll.staff?.name}`);
      setIsAdjustOpen(false);
      loadPayroll();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Adjustment failed");
    }
    setSubmitting(false);
  };

  const handlePaySalary = async (p: Payroll) => {
    const res = await payrollService.paySalary(p.id, "Bank Transfer");
    if (res.success) {
      setSuccessMsg(res.message || "Salary marked as paid");
      loadPayroll();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Salary payment failed");
    }
  };

  const totalBasic = payrolls.reduce((sum, p) => sum + p.basicSalary, 0);
  const totalDeductions = payrolls.reduce(
    (sum, p) => sum + p.lateDeduction + p.absentDeduction + p.loanDeduction + (p.otherDeductions || 0),
    0
  );
  const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <DashboardLayout
      title="Staff Payroll & Salary Register"
      subtitle="Automated monthly salary calculation based on check-in punctuality, late rule, and leave deductions"
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

      {/* Control Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-center gap-3.5 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Payroll Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="p-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <strong>Institutional Deductions:</strong> Working days: <span className="font-bold text-slate-800">{setting?.workingDaysPerMonth || 26}</span> • 1 Unapproved Absent = 1 Day Cut • {setting?.lateRuleDays || 3} Lates = 1 Day Salary Deduction.
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <Button onClick={handleGeneratePayroll} loading={submitting} size="sm">
            Recalculate Payroll
          </Button>
          <Button onClick={() => setIsPrintSheetOpen(true)} variant="outline" size="sm">
            Print Master Sheet (A4)
          </Button>
        </div>
      </div>

      {/* Financial KPI bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-center">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Total Gross Salaries</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatPKR(totalBasic)}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{payrolls.length} Employees</span>
        </div>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl shadow-xs text-center">
          <span className="text-[11px] text-rose-700 font-semibold uppercase tracking-wider block">Total Deductions (Lates/Absents)</span>
          <p className="text-2xl font-bold text-rose-700 mt-1">-{formatPKR(totalDeductions)}</p>
          <span className="text-[10px] text-rose-600/80 mt-0.5 block">Automated salary cuts</span>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs text-center">
          <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider block">Total Net Bank Payable</span>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{formatPKR(totalNet)}</p>
          <span className="text-[10px] text-emerald-600/80 mt-0.5 block">Disbursement commitment</span>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Staff Monthly Payroll Register: {selectedMonth}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {payrolls.length} employees calculated
          </span>
        </div>

        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Emp No</th>
                <th className="py-3 px-4 whitespace-nowrap">Staff Name</th>
                <th className="py-3 px-4 whitespace-nowrap">Designation</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-right">Basic Pay</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Days (Pres/Wk)</th>
                <th className="py-3 px-2.5 whitespace-nowrap text-center">Lates</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Late Cut</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Absent Cut</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-right">Net Payable</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading monthly payroll...</span>
                    </div>
                  </td>
                </tr>
              ) : payrolls.length > 0 ? (
                payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                        {p.staff?.employeeNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">{p.staff?.name}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">{p.staff?.designation}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-right font-mono text-slate-800">{formatPKR(p.basicSalary)}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <span className="font-bold text-slate-800">{p.daysPresent}</span> / {p.workingDays}
                    </td>
                    <td className="py-3 px-2.5 whitespace-nowrap text-center font-mono">
                      {p.latesCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                          {p.latesCount}
                        </span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-right text-rose-600 font-mono font-medium">
                      {p.lateDeduction > 0 ? `-${formatPKR(p.lateDeduction)}` : "-"}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-right text-rose-600 font-mono font-medium">
                      {p.absentDeduction > 0 ? `-${formatPKR(p.absentDeduction)}` : "-"}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-right font-bold text-emerald-800 font-mono text-xs">
                      {formatPKR(p.netSalary)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== "Paid" && (
                          <button
                            onClick={() => handlePaySalary(p)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="px-2.5 py-1 border border-slate-200 hover:border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPayroll(p);
                            setIsPrintSlipOpen(true);
                          }}
                          className="px-2.5 py-1 border border-slate-200 hover:border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                        >
                          Pay Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No payroll entries generated for this month. Click &quot;Recalculate Payroll&quot; above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {selectedPayroll && (
        <Modal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          title={`Manual Salary Adjustment: ${selectedPayroll.staff?.name}`}
          description={`Emp No: ${selectedPayroll.staff?.employeeNo} • Basic: ${formatPKR(selectedPayroll.basicSalary)}`}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveAdjust} className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Bonus / Special Allowance (PKR)</label>
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Other Deductions / Tax (PKR)</label>
              <input
                type="number"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Adjustment Reason / Note *</label>
              <input
                type="text"
                required
                value={adjustRemarks}
                onChange={(e) => setAdjustRemarks(e.target.value)}
                placeholder="Reason for adjustment"
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white text-zinc-900"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdjustOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} size="sm">
                Save Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Salary Slip (A4) Modal */}
      {selectedPayroll && isPrintSlipOpen && (
        <Modal
          isOpen={isPrintSlipOpen}
          onClose={() => setIsPrintSlipOpen(false)}
          title={`Salary Slip: ${selectedPayroll.staff?.name}`}
          maxWidth="md"
        >
          <div className="print:m-0 print:p-0">
            <div className="flex justify-end mb-3 print:hidden">
              <Button size="sm" onClick={() => window.print()}>
                Print Salary Slip
              </Button>
            </div>
            <div className="border border-black p-6 bg-white text-black font-serif text-xs leading-normal print:border-none print:p-0">
              <div className="text-center border-b border-black pb-2 mb-3">
                <h2 className="text-base font-bold uppercase">{setting?.schoolName}</h2>
                <p className="text-[10px]">{setting?.address} • Phone: {setting?.phone}</p>
                <div className="mt-1 font-bold border border-black inline-block px-3 py-0.5 uppercase bg-zinc-100 text-[10px]">
                  Staff Salary Slip ({selectedPayroll.month})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border border-black p-2 mb-3 text-[11px]">
                <div><strong>Employee No:</strong> {selectedPayroll.staff?.employeeNo}</div>
                <div><strong>Staff Name:</strong> {selectedPayroll.staff?.name}</div>
                <div><strong>CNIC:</strong> {selectedPayroll.staff?.cnic}</div>
                <div><strong>Designation:</strong> {selectedPayroll.staff?.designation}</div>
                <div><strong>Working Days:</strong> {selectedPayroll.workingDays}</div>
                <div><strong>Days Present:</strong> {selectedPayroll.daysPresent}</div>
                <div><strong>Lates Count:</strong> {selectedPayroll.latesCount}</div>
                <div><strong>Status:</strong> {selectedPayroll.status}</div>
              </div>

              <table className="w-full text-xs border-collapse border border-black mb-4">
                <thead>
                  <tr className="bg-zinc-100 border-b border-black">
                    <th className="py-1 px-2 text-left">Earnings</th>
                    <th className="py-1 px-2 text-right">Amount</th>
                    <th className="py-1 px-2 text-left border-l border-black">Deductions</th>
                    <th className="py-1 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  <tr>
                    <td className="py-1 px-2">Basic Salary</td>
                    <td className="py-1 px-2 text-right">{formatPKR(selectedPayroll.basicSalary)}</td>
                    <td className="py-1 px-2 border-l border-black">Late Cut ({selectedPayroll.lateDeductionDays} days)</td>
                    <td className="py-1 px-2 text-right">{formatPKR(selectedPayroll.lateDeduction)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2">Allowance</td>
                    <td className="py-1 px-2 text-right">{formatPKR(selectedPayroll.allowance)}</td>
                    <td className="py-1 px-2 border-l border-black">Absent / Unpaid Leave</td>
                    <td className="py-1 px-2 text-right">{formatPKR(selectedPayroll.absentDeduction)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2">Bonus</td>
                    <td className="py-1 px-2 text-right">{formatPKR(selectedPayroll.bonus)}</td>
                    <td className="py-1 px-2 border-l border-black">Loan / Advance Deduction</td>
                    <td className="py-1 px-2 text-right">{formatPKR(selectedPayroll.loanDeduction)}</td>
                  </tr>
                  <tr className="font-bold border-t-2 border-black bg-zinc-50">
                    <td className="py-1.5 px-2">Gross Earnings</td>
                    <td className="py-1.5 px-2 text-right">
                      {formatPKR(selectedPayroll.basicSalary + selectedPayroll.allowance + selectedPayroll.bonus)}
                    </td>
                    <td className="py-1.5 px-2 border-l border-black">Net Salary Payable</td>
                    <td className="py-1.5 px-2 text-right text-emerald-800">
                      {formatPKR(selectedPayroll.netSalary)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 text-center pt-8 text-[11px] font-semibold">
                <div>
                  <div className="border-t border-black mx-4 pt-1">Employee Signature</div>
                </div>
                <div>
                  <div className="border-t border-black mx-4 pt-1">Accountant / Principal Stamp</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Printable Monthly Payroll Sheet (A4) Modal */}
      {isPrintSheetOpen && (
        <Modal
          isOpen={isPrintSheetOpen}
          onClose={() => setIsPrintSheetOpen(false)}
          title={`Monthly Payroll Sheet: ${selectedMonth}`}
          maxWidth="4xl"
        >
          <div className="print:m-0 print:p-0">
            <div className="flex justify-end mb-3 print:hidden">
              <Button size="sm" onClick={() => window.print()}>
                Print Payroll Sheet
              </Button>
            </div>
            <div className="border border-black p-6 bg-white text-black font-serif text-[11px] max-w-[297mm] mx-auto print:border-none print:p-0">
              <div className="text-center border-b border-black pb-2 mb-3">
                <h2 className="text-base font-bold uppercase">{setting?.schoolName}</h2>
                <p className="text-xs">Monthly Staff Salary Register ({selectedMonth})</p>
              </div>

              <table className="w-full text-left border-collapse border border-black mb-4">
                <thead>
                  <tr className="bg-zinc-100 border-b border-black">
                    <th className="p-1">Emp No</th>
                    <th className="p-1">Staff Name</th>
                    <th className="p-1">Designation</th>
                    <th className="p-1 text-right">Basic</th>
                    <th className="p-1 text-center">Pres/Wk</th>
                    <th className="p-1 text-center">Lates</th>
                    <th className="p-1 text-right">Late Cut</th>
                    <th className="p-1 text-right">Absent Cut</th>
                    <th className="p-1 text-right">Net Salary</th>
                    <th className="p-1 text-center">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {payrolls.map((p) => (
                    <tr key={p.id}>
                      <td className="p-1 font-mono">{p.staff?.employeeNo}</td>
                      <td className="p-1 font-medium">{p.staff?.name}</td>
                      <td className="p-1">{p.staff?.designation}</td>
                      <td className="p-1 text-right">{formatPKR(p.basicSalary)}</td>
                      <td className="p-1 text-center">{p.daysPresent}/{p.workingDays}</td>
                      <td className="p-1 text-center">{p.latesCount}</td>
                      <td className="p-1 text-right">{p.lateDeduction > 0 ? formatPKR(p.lateDeduction) : "-"}</td>
                      <td className="p-1 text-right">{p.absentDeduction > 0 ? formatPKR(p.absentDeduction) : "-"}</td>
                      <td className="p-1 text-right font-bold">{formatPKR(p.netSalary)}</td>
                      <td className="p-1 text-center">________________</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-black font-bold bg-zinc-100">
                    <td colSpan={3} className="p-1">Total Pay Roll Summary</td>
                    <td className="p-1 text-right">{formatPKR(totalBasic)}</td>
                    <td colSpan={2} className="p-1"></td>
                    <td colSpan={2} className="p-1 text-right text-red-700">-{formatPKR(totalDeductions)}</td>
                    <td className="p-1 text-right">{formatPKR(totalNet)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 text-center pt-8 text-xs font-semibold">
                <div>
                  <div className="border-t border-black mx-12 pt-1">Prepared by Accountant</div>
                </div>
                <div>
                  <div className="border-t border-black mx-12 pt-1">Approved by Principal</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
