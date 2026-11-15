"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { studentService } from "@/services/studentService";
import { feeService } from "@/services/feeService";
import { payrollService } from "@/services/payrollService";
import { expenseService } from "@/services/expenseService";
import { settingsService } from "@/services/settingsService";
import { Student, FeeChallan, Payroll, Expense, SchoolSetting } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatPKR, formatDate } from "@/lib/formatters";
import {
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  Receipt,
  CreditCard,
  TrendingDown,
} from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"students" | "fees" | "payroll" | "expenses">("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [challans, setChallans] = useState<FeeChallan[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [setting, setSetting] = useState<SchoolSetting | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [reportType]);

  const loadData = async () => {
    setLoading(true);
    const setRes = await settingsService.getSettings();
    if (setRes.success) setSetting(setRes.data);

    if (reportType === "students") {
      const res = await studentService.getAll({ status: "Active" });
      if (res.success && res.data) setStudents(res.data);
    } else if (reportType === "fees") {
      const res = await feeService.getChallans();
      if (res.success && res.data) setChallans(res.data);
    } else if (reportType === "payroll") {
      const res = await payrollService.getPayrolls();
      if (res.success && res.data) setPayrolls(res.data.payrolls);
    } else if (reportType === "expenses") {
      const res = await expenseService.getExpenses();
      if (res.success && res.data) setExpenses(res.data.expenses);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    let csv = "";
    let filename = `report_${reportType}.csv`;

    if (reportType === "students") {
      csv = "AdmissionNo,RollNo,StudentName,FatherName,FatherPhone,BForm,Class,Status\n";
      students.forEach((s) => {
        csv += `"${s.admissionNo}","${s.rollNo}","${s.name}","${s.fatherName}","${s.fatherPhone}","${s.bFormNo}","${s.classSection?.name}","${s.status}"\n`;
      });
    } else if (reportType === "fees") {
      csv = "ChallanNo,StudentName,AdmissionNo,Month,Tuition,Arrears,TotalPayable,PaidAmount,Balance,Status\n";
      challans.forEach((c) => {
        csv += `"${c.challanNo}","${c.student?.name}","${c.student?.admissionNo}","${c.month}",${c.tuitionFee},${c.arrears},${c.totalPayable},${c.paidAmount},${c.balance},"${c.status}"\n`;
      });
    } else if (reportType === "payroll") {
      csv = "EmployeeNo,StaffName,Designation,Month,BasicSalary,LateDeduction,AbsentDeduction,NetSalary,Status\n";
      payrolls.forEach((p) => {
        csv += `"${p.staff?.employeeNo}","${p.staff?.name}","${p.staff?.designation}","${p.month}",${p.basicSalary},${p.lateDeduction},${p.absentDeduction},${p.netSalary},"${p.status}"\n`;
      });
    } else if (reportType === "expenses") {
      csv = "VoucherNo,Title,Category,Amount,Date,PaidTo,Method\n";
      expenses.forEach((e) => {
        csv += `"#EXP-${e.id}","${e.title}","${e.category}",${e.amount},"${e.date}","${e.paidTo}","${e.paymentMethod}"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout
      title="Official Reports & Data Exports"
      subtitle="Audit-compliant tabular statements with direct print preview and CSV Excel export"
    >
      {/* Control Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs mb-5 flex flex-col md:flex-row items-center gap-3 justify-between print:hidden">
        {/* Segmented Pill Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setReportType("students")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              reportType === "students"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Students Gazette
          </button>
          <button
            onClick={() => setReportType("fees")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              reportType === "fees"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Fee Register
          </button>
          <button
            onClick={() => setReportType("payroll")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              reportType === "payroll"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payroll Register
          </button>
          <button
            onClick={() => setReportType("expenses")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              reportType === "expenses"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Expenses Ledger
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV / Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 rounded-xl shadow-xs print:border-none print:p-0 print:shadow-none font-sans text-xs">
        {/* Institutional Letterhead */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
          <h2 className="text-xl font-extrabold uppercase text-slate-900 tracking-wide">{setting?.schoolName}</h2>
          <p className="text-xs text-slate-600 mt-0.5">{setting?.address} • Phone: {setting?.phone}</p>
          <p className="text-[11px] text-slate-500">Reg No: {setting?.regNo} • Academic Session: {setting?.sessionYear}</p>
          <div className="mt-2.5 font-bold uppercase text-xs tracking-wider inline-block px-3.5 py-1 bg-slate-100 border border-slate-300 rounded-full text-slate-800">
            {reportType === "students" && "Official Student Enrollment Gazette"}
            {reportType === "fees" && "Fee Collection & Arrears Statement"}
            {reportType === "payroll" && "Monthly Staff Payroll Register"}
            {reportType === "expenses" && "School Operational Expenditure Ledger"}
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading statement...</div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            {reportType === "students" && (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Admission No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Roll No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Student Name</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Father Name</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Father CNIC</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">B-Form</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Class</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">{s.admissionNo}</td>
                      <td className="py-2 px-3 font-mono whitespace-nowrap">{s.rollNo}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">{s.name}</td>
                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap">{s.fatherName}</td>
                      <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">{s.fatherCnic}</td>
                      <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">{s.bFormNo}</td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium">{s.classSection?.name}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === "fees" && (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Challan No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Student</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Class</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Month</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Total Billed</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Paid Amount</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Balance</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {challans.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">{c.challanNo}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">{c.student?.name}</td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium">{c.classSection?.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">{c.month}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium whitespace-nowrap">{formatPKR(c.totalPayable)}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700 font-semibold whitespace-nowrap">{formatPKR(c.paidAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-700 font-bold whitespace-nowrap">{formatPKR(c.balance)}</td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === "payroll" && (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Emp No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Staff Name</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Designation</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Month</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Basic Salary</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Late Cut</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Absent Cut</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Net Salary</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">{p.staff?.employeeNo}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">{p.staff?.name}</td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{p.staff?.designation}</td>
                      <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">{p.month}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium whitespace-nowrap">{formatPKR(p.basicSalary)}</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-600 whitespace-nowrap">{formatPKR(p.lateDeduction)}</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-600 whitespace-nowrap">{formatPKR(p.absentDeduction)}</td>
                      <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-700 whitespace-nowrap">{formatPKR(p.netSalary)}</td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === "expenses" && (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Voucher No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Title</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Category</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Paid To</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Method</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">#EXP-{e.id}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">{e.title}</td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-600">{e.category}</td>
                      <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">{formatDate(e.date)}</td>
                      <td className="py-2 px-3 font-medium text-slate-800 whitespace-nowrap">{e.paidTo}</td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{e.paymentMethod}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">{formatPKR(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Official Signatures */}
        <div className="grid grid-cols-3 text-center pt-12 text-xs font-semibold">
          <div>
            <div className="border-t border-slate-900 mx-4 pt-1.5 text-slate-800">Prepared by Clerk</div>
          </div>
          <div>
            <div className="border-t border-slate-900 mx-4 pt-1.5 text-slate-800">Accounts Officer</div>
          </div>
          <div>
            <div className="border-t border-slate-900 mx-4 pt-1.5 text-slate-800">Principal / Head of Institution</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
