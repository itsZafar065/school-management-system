import { apiRequest } from "./api";
import { LeaveApplication } from "@/types";

export const leaveService = {
  async getLeaves(params?: { status?: string; applicantType?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.applicantType) query.append("applicantType", params.applicantType);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<LeaveApplication[]>(`/leaves${qs}`);
  },

  async applyLeave(data: Partial<LeaveApplication>) {
    return await apiRequest<LeaveApplication>("/leaves", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: number, status: "Approved" | "Rejected", remarks?: string) {
    return await apiRequest<LeaveApplication>(`/leaves/${id}/action`, {
      method: "POST",
      body: JSON.stringify({ status, remarks }),
    });
  },
};
