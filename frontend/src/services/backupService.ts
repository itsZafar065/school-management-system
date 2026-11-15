import { apiRequest } from "./api";
import { AuditLog } from "@/types";

export const backupService = {
  getDownloadUrl() {
    const token = typeof window !== "undefined" ? localStorage.getItem("sms_token") : "";
    return `http://localhost:5000/api/backup/download?token=${token}`;
  },

  async getAuditLogs() {
    return await apiRequest<AuditLog[]>("/backup/audit");
  },
};
