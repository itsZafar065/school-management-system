import { apiRequest } from "./api";
import { DashboardStats } from "@/types";

export const dashboardService = {
  async getStats() {
    return await apiRequest<DashboardStats>("/dashboard/stats");
  },
};
