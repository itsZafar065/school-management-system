import { apiRequest } from "./api";
import { ClassItem } from "@/types";

export const classService = {
  async getAll() {
    return await apiRequest<ClassItem[]>("/classes");
  },

  async getById(id: number) {
    return await apiRequest<ClassItem>(`/classes/${id}`);
  },

  async create(data: Partial<ClassItem>) {
    return await apiRequest<ClassItem>("/classes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<ClassItem>) {
    return await apiRequest<ClassItem>(`/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: number) {
    return await apiRequest<{ id: number }>(`/classes/${id}`, {
      method: "DELETE",
    });
  },
};
