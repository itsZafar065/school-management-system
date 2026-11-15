import { apiRequest } from "./api";
import { ExamTerm, ExamResult, SchoolSetting, Student } from "@/types";

export const examService = {
  async getTerms() {
    return await apiRequest<ExamTerm[]>("/exams/terms");
  },

  async createTerm(data: { title: string; sessionYear: string; startDate: string; endDate: string }) {
    return await apiRequest<ExamTerm>("/exams/terms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async lockTerm(id: number, isLocked: boolean = true) {
    return await apiRequest<ExamTerm>(`/exams/terms/${id}/lock`, {
      method: "POST",
      body: JSON.stringify({ isLocked }),
    });
  },

  async getResults(params?: { examTermId?: number; classSectionId?: number; subjectId?: number }) {
    const query = new URLSearchParams();
    if (params?.examTermId) query.append("examTermId", String(params.examTermId));
    if (params?.classSectionId) query.append("classSectionId", String(params.classSectionId));
    if (params?.subjectId) query.append("subjectId", String(params.subjectId));

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<ExamResult[]>(`/exams/results${qs}`);
  },

  async saveResults(payload: {
    examTermId: number;
    classSectionId: number;
    subjectId: number;
    marksList: { studentId: number; obtainedMarks: number; remarks?: string }[];
  }) {
    return await apiRequest<{ count: number }>("/exams/results", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getReportCard(studentId: number, examTermId?: number) {
    const qs = examTermId ? `?examTermId=${examTermId}` : "";
    return await apiRequest<{
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
    }>(`/exams/report-card/${studentId}${qs}`);
  },
};
