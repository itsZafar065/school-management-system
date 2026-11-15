import { apiRequest } from "./api";
import { Payroll, SchoolSetting } from "@/types";

export const payrollService = {
  async getPayrolls(params?: { month?: string; staffId?: number; status?: string }) {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month);
    if (params?.staffId) query.append("staffId", String(params.staffId));
    if (params?.status) query.append("status", params.status);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<{ month: string; payrolls: Payroll[]; setting: SchoolSetting }>(
      `/payroll${qs}`
    );
  },

  async generatePayroll(month: string) {
    return await apiRequest<{ count: number; month: string }>("/payroll/generate", {
      method: "POST",
      body: JSON.stringify({ month }),
    });
  },

  async updatePayroll(id: number, data: { bonus?: number; otherDeductions?: number; remarks?: string }) {
    return await apiRequest<Payroll>(`/payroll/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async paySalary(id: number, paymentMethod: string = "Bank Transfer") {
    return await apiRequest<Payroll>(`/payroll/${id}/pay`, {
      method: "POST",
      body: JSON.stringify({ paymentMethod }),
    });
  },
};
