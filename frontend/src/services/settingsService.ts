import { apiRequest } from "./api";
import { SchoolSetting } from "@/types";

export const settingsService = {
  async getSettings() {
    return await apiRequest<SchoolSetting>("/settings");
  },

  async updateSettings(data: Partial<SchoolSetting>) {
    return await apiRequest<SchoolSetting>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
