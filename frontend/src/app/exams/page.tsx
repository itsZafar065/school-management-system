"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { examService } from "@/services/examService";
import { classService } from "@/services/classService";
import { studentService } from "@/services/studentService";
import { settingsService } from "@/services/settingsService";
import { ExamTerm, ExamResult, ClassItem, Student, SchoolSetting } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Unlock,
  Printer,
  TrendingUp,
} from "lucide-react";

export default function ExamsPage() {
  const [terms, setTerms] = useState<ExamTerm[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<number>(1);
  const [selectedClassId, setSelectedClassId] = useState<number>(1);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [setting, setSetting] = useState<SchoolSetting | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab: 'results' | 'entry' | 'reportcard'
  const [activeTab, setActiveTab] = useState<"results" | "entry">("results");

  // Marks Entry Form state
  const [entrySubjectName, setEntrySubjectName] = useState("Mathematics");
  const [entrySubjectId, setEntrySubjectId] = useState(1);
  const [entryMaxMarks, setEntryMaxMarks] = useState(100);
  const [marksGrid, setMarksGrid] = useState<{ studentId: number; name: string; rollNo: string; obtainedMarks: number; remarks: string }[]>([]);

  // Report Card Modal state
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [reportCardData, setReportCardData] = useState<{
    student: Student;
    examTerm: ExamTerm;
    results: ExamResult[];
    summary: {
      totalMax: number;
      totalObtained: number;
      percentage: number;
      grade: string;
      status: string;
      attendancePercentage: number;
    };
    school: SchoolSetting;
  } | null>(null);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    const [termsRes, classesRes, setRes] = await Promise.all([
      examService.getTerms(),
      classService.getAll(),
      settingsService.getSettings(),
    ]);

    if (termsRes.success && termsRes.data && termsRes.data.length > 0) {
      const tData = termsRes.data;
      setTerms(tData);
      setSelectedTermId(tData[0].id);
    }
    if (classesRes.success && classesRes.data && classesRes.data.length > 0) {
      const cData = classesRes.data;
      setClasses(cData);
      setSelectedClassId(cData[0].id);
    }
    if (setRes.success && setRes.data) setSetting(setRes.data);
    setLoading(false);
  };

  const fetchResults = async () => {
    if (!selectedTermId || !selectedClassId) return;
    setLoading(true);
    const [resRes, stuRes] = await Promise.all([
      examService.getResults({ examTermId: selectedTermId, classSectionId: selectedClassId }),
      studentService.getAll({ classSectionId: selectedClassId, status: "Active" }),
    ]);

    if (resRes.success && resRes.data) setResults(resRes.data);
    if (stuRes.success && stuRes.data) {
      setClassStudents(stuRes.data);
      // Initialize marks grid
      const grid = stuRes.data.map((s) => {
        const found = resRes.data?.find((r) => r.studentId === s.id && r.subject?.name === entrySubjectName);
        return {
          studentId: s.id,
          name: s.name,
          rollNo: s.rollNo,
          obtainedMarks: found ? found.obtainedMarks : 75,
          remarks: found ? found.remarks || "" : "Good",
        };
      });
      setMarksGrid(grid);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, [selectedTermId, selectedClassId, entrySubjectName]);

  const activeTerm = terms.find((t) => t.id === selectedTermId);

  const handleToggleLock = async () => {
    if (!activeTerm) return;
    const newLock = !activeTerm.isLocked;
    const res = await examService.lockTerm(activeTerm.id, newLock);
    if (res.success) {
      setSuccessMsg(`Exam results have been ${newLock ? "LOCKED and approved by Principal" : "UNLOCKED"}.`);
      setTerms((prev) => prev.map((t) => (t.id === activeTerm.id ? { ...t, isLocked: newLock } : t)));
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Lock failed");
    }
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTerm?.isLocked) {
      setError("Results are locked by the Principal. Cannot modify marks.");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await examService.saveResults({
      examTermId: selectedTermId,
      classSectionId: selectedClassId,
      subjectId: entrySubjectId,
      marksList: marksGrid.map((g) => ({
        studentId: g.studentId,
        obtainedMarks: g.obtainedMarks,
        remarks: g.remarks,
      })),
    });

    if (res.success) {
      setSuccessMsg(`Marks for ${entrySubjectName} saved successfully.`);
      fetchResults();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || "Saving marks failed");
    }
    setSaving(false);
  };

  const handleOpenReportCard = async (studentId: number) => {
    setLoading(true);
    const res = await examService.getReportCard(studentId, selectedTermId);
    if (res.success && res.data) {
      setReportCardData(res.data);
      setIsReportCardOpen(true);
    } else {
      setError(res.error || "Failed to compile report card");
    }
    setLoading(false);
  };

  // Group results by student for gazette view
  const studentResultMap: Record<number, { student: Student; list: ExamResult[]; total: number; max: number }> = {};
  results.forEach((r) => {
    if (!r.student) return;
    if (!studentResultMap[r.studentId]) {
      studentResultMap[r.studentId] = { student: r.student, list: [], total: 0, max: 0 };
    }
    studentResultMap[r.studentId].list.push(r);
    studentResultMap[r.studentId].total += r.obtainedMarks;
    studentResultMap[r.studentId].max += r.totalMarks;
  });

  const studentResultList = Object.values(studentResultMap);
  const totalGazetteStudents = studentResultList.length;
  const passedStudents = studentResultList.filter(({ total, max }) => max > 0 && (total / max) >= 0.33).length;
  const failedStudents = totalGazetteStudents - passedStudents;
  const overallClassAvg = totalGazetteStudents > 0
    ? (studentResultList.reduce((acc, { total, max }) => acc + (max > 0 ? (total / max) * 100 : 0), 0) / totalGazetteStudents).toFixed(1)
    : "0.0";

  return (
    <DashboardLayout
      title="Examinations & Results Gazette"
      subtitle="Teacher marks entry, Principal approval lock, class result gazette, and printable A4 report cards"
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class Enrolled</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{totalGazetteStudents}</p>
            <p className="text-[11px] text-slate-500 mt-1">Evaluated students</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passed Candidates</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">{passedStudents}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {totalGazetteStudents > 0 ? `${Math.round((passedStudents / totalGazetteStudents) * 100)}% Pass Rate` : "N/A"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Failed / Retake</p>
            <p className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-0.5">{failedStudents}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">Below passing criteria</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class Average</p>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-0.5">{overallClassAvg}%</p>
            <p className="text-[11px] text-purple-600 font-medium mt-1">Overall percentage</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs mb-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Exam Term</label>
            <select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(parseInt(e.target.value))}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.isLocked ? "Approved & Locked" : "In Progress"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Class & Section</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 pt-1 mt-auto">
            <button
              onClick={() => setActiveTab("results")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "results"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Result Gazette
            </button>
            <button
              onClick={() => setActiveTab("entry")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "entry"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Enter / Edit Marks
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleToggleLock}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTerm?.isLocked
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {activeTerm?.isLocked ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                Principal: Unlock Marks
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Principal: Approve & Lock
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lock Notice */}
      {activeTerm?.isLocked && (
        <div className="mb-4 p-3 bg-slate-900 text-white text-xs rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>This examination term is <strong>LOCKED and APPROVED by the Principal</strong>. Marks entries are final and gazetted.</span>
          </div>
          <span className="font-mono text-[11px] bg-slate-800 px-2.5 py-0.5 rounded text-emerald-400 font-bold border border-slate-700">
            GAZETTED
          </span>
        </div>
      )}

      {/* Tab: Results Gazette */}
      {activeTab === "results" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Class Result Gazette: {classes.find((c) => c.id === selectedClassId)?.name} ({activeTerm?.title})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Total Students: {studentResultList.length}
            </span>
          </div>
          <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap">Adm No</th>
                  <th className="py-3 px-4 whitespace-nowrap">Student Name</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Father Name</th>
                  <th className="py-3 px-3 whitespace-nowrap text-right">Total Obtained</th>
                  <th className="py-3 px-3 whitespace-nowrap text-right">Max Marks</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center">Percentage</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center">Grade</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center">Result</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentResultList.length > 0 ? (
                  studentResultList.map(({ student, total, max }) => {
                    const pct = max > 0 ? ((total / max) * 100).toFixed(1) : 0;
                    const numPct = parseFloat(String(pct));
                    let grade = "F";
                    if (numPct >= 80) grade = "A+";
                    else if (numPct >= 70) grade = "A";
                    else if (numPct >= 60) grade = "B";
                    else if (numPct >= 50) grade = "C";
                    else if (numPct >= 40) grade = "D";

                    return (
                      <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">
                          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                            {student.admissionNo}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">{student.name}</td>
                        <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">{student.fatherName}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-right font-bold text-slate-900 font-mono">{total}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-right font-mono text-slate-500">{max}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-center font-bold text-slate-800">{pct}%</td>
                        <td className="py-3 px-3 whitespace-nowrap text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            grade === "A+" || grade === "A" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-800 border border-slate-200"
                          }`}>
                            {grade}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              numPct >= 33
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {numPct >= 33 ? "PASSED" : "FAILED"}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleOpenReportCard(student.id)}
                            className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                          >
                            Print Report Card (A4)
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No results entered for this class yet. Select &quot;Enter / Edit Marks&quot; above to enter marks.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Enter Marks Grid */}
      {activeTab === "entry" && (
        <form onSubmit={handleSaveMarks} className="space-y-4">
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Subject</label>
                <select
                  value={entrySubjectName}
                  onChange={(e) => setEntrySubjectName(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="Mathematics">Mathematics (Max: 100)</option>
                  <option value="Physics">Physics (Max: 100)</option>
                  <option value="Chemistry">Chemistry (Max: 100)</option>
                  <option value="English Compulsory">English Compulsory (Max: 100)</option>
                  <option value="Urdu Compulsory">Urdu Compulsory (Max: 100)</option>
                  <option value="Computer Science">Computer Science (Max: 100)</option>
                  <option value="Islamiyat / Pak Studies">Islamiyat (Max: 50)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Max Marks</label>
                <input
                  type="number"
                  value={entrySubjectName === "Islamiyat / Pak Studies" ? 50 : entryMaxMarks}
                  onChange={(e) => setEntryMaxMarks(parseInt(e.target.value) || 100)}
                  className="w-24 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={activeTerm?.isLocked}
              loading={saving}
              size="sm"
            >
              {activeTerm?.isLocked ? "Marks Locked by Principal" : "Save Subject Marks"}
            </Button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 whitespace-nowrap">Roll No</th>
                    <th className="py-3 px-4 whitespace-nowrap">Student Name</th>
                    <th className="py-3 px-3 whitespace-nowrap">Max Marks</th>
                    <th className="py-3 px-4 whitespace-nowrap">Obtained Marks (Cannot Exceed Max)</th>
                    <th className="py-3 px-4 whitespace-nowrap">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marksGrid.map((row, idx) => (
                    <tr key={row.studentId} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-blue-900">{row.rollNo}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">{row.name}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-500">
                        {entrySubjectName === "Islamiyat / Pak Studies" ? 50 : entryMaxMarks}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <input
                          type="number"
                          min={0}
                          max={entrySubjectName === "Islamiyat / Pak Studies" ? 50 : entryMaxMarks}
                          disabled={activeTerm?.isLocked}
                          value={row.obtainedMarks}
                          onChange={(e) => {
                            const val = Math.min(
                              entrySubjectName === "Islamiyat / Pak Studies" ? 50 : entryMaxMarks,
                              Math.max(0, parseFloat(e.target.value) || 0)
                            );
                            setMarksGrid((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, obtainedMarks: val } : r))
                            );
                          }}
                          className="w-32 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <input
                          type="text"
                          disabled={activeTerm?.isLocked}
                          value={row.remarks}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMarksGrid((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, remarks: val } : r))
                            );
                          }}
                          placeholder="e.g. Excellent progress"
                          className="w-full max-w-sm px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      )}

      {/* Printable A4 Report Card Modal */}
      {reportCardData && isReportCardOpen && (
        <Modal
          isOpen={isReportCardOpen}
          onClose={() => setIsReportCardOpen(false)}
          title={`Student Report Card: ${reportCardData.student.name}`}
          maxWidth="4xl"
        >
          <div className="print:m-0 print:p-0">
            <div className="flex justify-end mb-3 print:hidden">
              <Button size="sm" onClick={() => window.print()}>
                Print Report Card (A4)
              </Button>
            </div>

            {/* A4 Report Card Container */}
            <div className="border-2 border-black p-8 bg-white text-black font-serif text-xs leading-normal max-w-[210mm] mx-auto print:border-none print:p-0">
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h1 className="text-xl font-bold uppercase tracking-wider">{reportCardData.school?.schoolName}</h1>
                <p className="text-xs">{reportCardData.school?.address} • Phone: {reportCardData.school?.phone}</p>
                <p className="text-[10px]">Registered by Department of Education • Reg No: {reportCardData.school?.regNo}</p>
                <div className="mt-2 inline-block px-4 py-1 border border-black font-bold uppercase text-xs tracking-widest bg-zinc-100">
                  Student Cumulative Progress Report ({reportCardData.examTerm.title})
                </div>
              </div>

              {/* Student Bio Grid */}
              <div className="grid grid-cols-4 gap-2 border border-black p-3 mb-4 text-[11px]">
                <div><strong>Admission / GR No:</strong> {reportCardData.student.admissionNo}</div>
                <div><strong>Roll No:</strong> {reportCardData.student.rollNo}</div>
                <div className="col-span-2"><strong>Student Name:</strong> {reportCardData.student.name}</div>
                <div><strong>Class & Section:</strong> {reportCardData.student.classSection?.name} ({reportCardData.student.classSection?.section})</div>
                <div><strong>Session:</strong> {reportCardData.examTerm.sessionYear}</div>
                <div className="col-span-2"><strong>Father Name:</strong> {reportCardData.student.fatherName}</div>
                <div><strong>B-Form No:</strong> {reportCardData.student.bFormNo}</div>
                <div><strong>Attendance Rate:</strong> {reportCardData.summary.attendancePercentage}%</div>
                <div><strong>Final Grade:</strong> <strong className="text-sm">{reportCardData.summary.grade}</strong></div>
                <div><strong>Overall Status:</strong> <strong>{reportCardData.summary.status}</strong></div>
              </div>

              {/* Subject Wise Marks Table */}
              <table className="w-full text-xs border-collapse border border-black mb-4">
                <thead>
                  <tr className="bg-zinc-100 border-b border-black text-center font-bold">
                    <th className="py-1 px-2 text-left border-r border-black">Subject</th>
                    <th className="py-1 px-2 border-r border-black">Max Marks</th>
                    <th className="py-1 px-2 border-r border-black">Passing</th>
                    <th className="py-1 px-2 border-r border-black">Marks Obtained</th>
                    <th className="py-1 px-2 border-r border-black">Percentage</th>
                    <th className="py-1 px-2 border-r border-black">Grade</th>
                    <th className="py-1 px-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black text-center">
                  {reportCardData.results.map((r) => {
                    const pct = ((r.obtainedMarks / r.totalMarks) * 100).toFixed(0);
                    return (
                      <tr key={r.id}>
                        <td className="py-1 px-2 text-left font-medium border-r border-black">{r.subject?.name}</td>
                        <td className="py-1 px-2 border-r border-black font-mono">{r.totalMarks}</td>
                        <td className="py-1 px-2 border-r border-black font-mono">33%</td>
                        <td className="py-1 px-2 border-r border-black font-mono font-bold">{r.obtainedMarks}</td>
                        <td className="py-1 px-2 border-r border-black">{pct}%</td>
                        <td className="py-1 px-2 border-r border-black font-bold">{r.grade}</td>
                        <td className="py-1 px-2 text-left text-[11px]">{r.remarks || "Satisfactory"}</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-black font-bold bg-zinc-100">
                    <td className="py-1.5 px-2 text-left border-r border-black">Grand Total Summary</td>
                    <td className="py-1.5 px-2 border-r border-black font-mono">{reportCardData.summary.totalMax}</td>
                    <td className="py-1.5 px-2 border-r border-black">-</td>
                    <td className="py-1.5 px-2 border-r border-black font-mono text-sm">{reportCardData.summary.totalObtained}</td>
                    <td className="py-1.5 px-2 border-r border-black text-sm">{reportCardData.summary.percentage}%</td>
                    <td className="py-1.5 px-2 border-r border-black text-sm">{reportCardData.summary.grade}</td>
                    <td className="py-1.5 px-2 text-left font-bold">{reportCardData.summary.status}</td>
                  </tr>
                </tbody>
              </table>

              {/* Grading Scale Legend */}
              <div className="border border-black p-2 mb-6 text-[10px]">
                <strong>Grading Scale:</strong> A+ (80% & Above - Outstanding) | A (70-79% - Excellent) | B (60-69% - Good) | C (50-59% - Satisfactory) | D (40-49% - Pass) | F (Below 33% - Failed)
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 text-center pt-10 text-xs font-semibold">
                <div>
                  <div className="border-t border-black mx-6 pt-1">Class Teacher Signature</div>
                </div>
                <div>
                  <div className="border-t border-black mx-6 pt-1">Examination Incharge</div>
                </div>
                <div>
                  <div className="border-t border-black mx-6 pt-1">Principal Signature & Stamp</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
