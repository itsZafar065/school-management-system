import { apiRequest } from "./api";
import { User } from "@/types";

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(username: string, password: string) {
    const res = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem("sms_token", res.data.token);
      localStorage.setItem("sms_user", JSON.stringify(res.data.user));
    }

    return res;
  },

  async logout() {
    await apiRequest("/auth/logout", { method: "POST" });
    localStorage.removeItem("sms_token");
    localStorage.removeItem("sms_user");
  },

  async getMe() {
    return await apiRequest<User>("/auth/me");
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("sms_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("sms_token");
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("sms_token");
  },
};
