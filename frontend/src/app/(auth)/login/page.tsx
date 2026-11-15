"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { settingsService } from "@/services/settingsService";
import { SchoolSetting } from "@/types";
import { School, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setting, setSetting] = useState<SchoolSetting | null>(null);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.replace("/dashboard");
    }
    settingsService.getSettings().then((res) => {
      if (res.success && res.data) {
        setSetting(res.data);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login(username, password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Invalid username or password.");
      }
    } catch {
      setError("Server connection failed. Ensure backend service is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8">
          {/* School Brand Emblem */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-blue-500/25">
              <School className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {setting?.schoolName || "Al-Ilm Public High School"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Institutional Administration & Academic Portal
            </p>
            {setting?.address && (
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {setting.address} • {setting.phone}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username / Email Address
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. admin)"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Institutional Security Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Database Secured</span>
            </div>
            <span>Academic Session: 2025-2026</span>
          </div>
        </div>

        {/* Quick Demo Credentials Footer */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 mb-1">Demo Access Credentials:</div>
          <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
            <div>Admin: <span className="text-slate-200 font-semibold">admin / admin123</span></div>
            <div>Principal: <span className="text-slate-200 font-semibold">principal / principal123</span></div>
            <div>Accountant: <span className="text-slate-200 font-semibold">accountant / accountant123</span></div>
            <div>Teacher: <span className="text-slate-200 font-semibold">teacher / teacher123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
