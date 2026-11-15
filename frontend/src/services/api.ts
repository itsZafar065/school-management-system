import { getDemoFallback } from "./demoFallback";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; success: boolean; message?: string }> {
  try {
    const isVercelDemo =
      typeof window !== "undefined" &&
      window.location.hostname.includes("vercel.app") &&
      !process.env.NEXT_PUBLIC_API_URL;

    if (isVercelDemo) {
      const fallback = getDemoFallback(endpoint, options);
      if (fallback) {
        return { data: fallback as T, error: null, success: true, message: "Client demo mode loaded" };
      }
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("sms_token") : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const result = await res.json().catch(() => null);

    if (!res.ok) {
      // Fallback to demo data on serverless/preview if API is offline
      const fallback = getDemoFallback(endpoint, options);
      if (fallback) {
        return { data: fallback as T, error: null, success: true, message: "Demo mode loaded" };
      }
      const errorMsg =
        result?.message || `Request failed with status ${res.status}`;
      return { data: null, error: errorMsg, success: false, message: errorMsg };
    }

    return {
      data: result?.data !== undefined ? (result.data as T) : (result as T),
      error: null,
      success: true,
      message: result?.message || "Operation completed successfully",
    };
  } catch {
    // Network / Offline Error -> Fallback to Demo Data
    const fallback = getDemoFallback(endpoint, options);
    if (fallback) {
      return { data: fallback as T, error: null, success: true, message: "Demo mode active" };
    }
    return { data: null, error: "Network error. Please check server.", success: false, message: "Network error" };
  }
}

