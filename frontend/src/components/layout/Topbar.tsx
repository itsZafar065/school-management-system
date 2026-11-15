"use client";

import React from "react";
import { User } from "@/types";
import { Menu, Calendar, Clock, Database } from "lucide-react";

interface TopbarProps {
  user: User | null;
  title: string;
  subtitle?: string;
  onOpenMobile?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  title,
  subtitle,
  onOpenMobile,
}) => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const todayFormatted = `${day}/${month}/${year}`;

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between font-sans shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 leading-tight truncate mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* System Online Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Database className="w-3 h-3 text-emerald-600" />
          <span>SQLite Connected</span>
        </div>

        {/* Date Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{todayFormatted}</span>
        </div>

        {/* Academic Session */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Session: 2025-2026</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 sm:border-l sm:border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name || "System User"}
            </div>
            <div className="text-[10px] text-blue-600 font-semibold leading-tight">
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
