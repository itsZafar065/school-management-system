import { apiRequest } from "./api";
import { StudentAttendance, StaffAttendance } from "@/types";

export const attendanceService = {
  // Student Attendance
  async getStudentAttendance(params?: { date?: string; classSectionId?: string | number; class?: string }) {
    const query = new URLSearchParams();
    if (params?.date) query.append("date", params.date);
    if (params?.classSectionId) query.append("classSectionId", String(params.classSectionId));
    if (params?.class) query.append("class", params.class);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest<{ date: string; records: StudentAttendance[] }>(`/attendance${qs}`);
  },

  async getAttendance(params?: { date?: string; class?: string; classSectionId?: string | number }) {
    return this.getStudentAttendance(params);
  },

  async markStudentAttendance(payload: {
    date: string;
    records: { studentId: number; classSectionId?: number; status: string; remarks?: string }[];
  }) {
    return await apiRequest<{ date: string; count: number }>("/attendance/mark", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async markAttendance(payload: {
    date: string;
    records: any[];
  }) {
    return this.markStudentAttendance(payload);
  },

  // Staff Attendance
  async getStaffAttendance(date?: string) {
    const qs = date ? `?date=${date}` : "";
    return await apiRequest<{ date: string; records: StaffAttendance[] }>(`/attendance/staff${qs}`);
  },

  async staffCheckIn(staffId: number, checkInTime?: string, date?: string) {
    return await apiRequest<StaffAttendance>("/attendance/staff/checkin", {
      method: "POST",
      body: JSON.stringify({ staffId, checkInTime, date }),
    });
  },

  async markStaffAttendance(payload: {
    date: string;
    records: { staffId: number; checkInTime?: string; isLate?: boolean; status: string }[];
  }) {
    return await apiRequest<{ date: string; count: number }>("/attendance/staff/mark", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
