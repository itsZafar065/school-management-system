import { apiRequest } from "./api";
import { Student } from "@/types";

export const studentService = {
  async getAll(params?: { search?: string; classSectionId?: string | number; class?: string; className?: string; status?: string; fatherCnic?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.classSectionId) query.append("classSectionId", String(params.classSectionId));
    if (params?.class) query.append("class", params.class);
    if (params?.className) query.append("className", params.className);
    if (params?.status) query.append("status", params.status);
    if (params?.fatherCnic) query.append("fatherCnic", params.fatherCnic);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<Student[]>(`/students${qs}`);
  },

  async getById(id: number) {
    return await apiRequest<Student>(`/students/${id}`);
  },

  async create(data: Partial<Student>) {
    return await apiRequest<Student>("/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<Student>) {
    return await apiRequest<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: number, status: string, leavingDate?: string, leavingReason?: string) {
    return await apiRequest<Student>(`/students/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status, leavingDate, leavingReason }),
    });
  },

  async promote(id: number, targetClassSectionId: number, sessionYear?: string, finalResult?: string) {
    return await apiRequest<Student>(`/students/${id}/promote`, {
      method: "POST",
      body: JSON.stringify({ targetClassSectionId, sessionYear, finalResult }),
    });
  },

  async getSiblings(fatherCnic: string) {
    return await apiRequest<Student[]>(`/students/siblings?cnic=${encodeURIComponent(fatherCnic)}`);
  },
};
