import { apiRequest } from "./api";
import { FeeChallan, SchoolSetting, Student } from "@/types";

export const feeService = {
  async getChallans(params?: {
    month?: string;
    classSectionId?: string | number;
    status?: string;
    search?: string;
    studentId?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month);
    if (params?.classSectionId) query.append("classSectionId", String(params.classSectionId));
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.studentId) query.append("studentId", String(params.studentId));

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<FeeChallan[]>(`/fees/challans${qs}`);
  },

  async getChallanById(id: number) {
    return await apiRequest<{ challan: FeeChallan; school: SchoolSetting }>(`/fees/challans/${id}`);
  },

  async generateChallans(payload: {
    classSectionId: string | number;
    month: string;
    issueDate: string;
    dueDate: string;
    otherCharges?: number;
    otherChargesTitle?: string;
  }) {
    return await apiRequest<{ count: number; month: string }>("/fees/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async payChallan(
    id: number,
    payload: {
      amount: number;
      paymentMethod: string;
      bankName?: string;
      remarks?: string;
    }
  ) {
    return await apiRequest<FeeChallan>(`/fees/pay/${id}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getDefaulters(classSectionId?: string | number) {
    const qs = classSectionId && classSectionId !== "all" ? `?classSectionId=${classSectionId}` : "";
    return await apiRequest<FeeChallan[]>(`/fees/defaulters${qs}`);
  },

  async getReports() {
    return await apiRequest<{
      summary: { totalBilled: number; totalCollected: number; totalOutstanding: number };
      classWise: { name: string; billed: number; collected: number; balance: number }[];
      monthWise: { month: string; billed: number; collected: number; balance: number }[];
    }>("/fees/reports");
  },

  async getLedger(studentId: number) {
    return await apiRequest<Student>(`/fees/ledger/${studentId}`);
  },
};
