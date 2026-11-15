import { apiRequest } from "./api";
import { Staff } from "@/types";

export const teacherService = {
  async getAll(params?: { search?: string; role?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.role) query.append("role", params.role);
    if (params?.status) query.append("status", params.status);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<Staff[]>(`/teachers${qs}`);
  },

  async getById(id: number) {
    return await apiRequest<Staff>(`/teachers/${id}`);
  },

  async create(data: Partial<Staff>) {
    return await apiRequest<Staff>("/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<Staff>) {
    return await apiRequest<Staff>(`/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: number) {
    return await apiRequest<{ id: number }>(`/teachers/${id}`, {
      method: "DELETE",
    });
  },
};
