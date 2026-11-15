import { apiRequest } from "./api";
import { DiaryNotice } from "@/types";

export const diaryService = {
  async getEntries(params?: { type?: string; classSectionId?: string | number }) {
    const query = new URLSearchParams();
    if (params?.type) query.append("type", params.type);
    if (params?.classSectionId) query.append("classSectionId", String(params.classSectionId));

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<DiaryNotice[]>(`/diary${qs}`);
  },

  async createEntry(data: {
    type: "Notice" | "Diary";
    title: string;
    content: string;
    targetType: "All" | "Class";
    classSectionId?: number;
    date?: string;
  }) {
    return await apiRequest<DiaryNotice>("/diary", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteEntry(id: number) {
    return await apiRequest<{ id: number }>(`/diary/${id}`, {
      method: "DELETE",
    });
  },
};
