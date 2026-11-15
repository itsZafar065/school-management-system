"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, SchoolSetting } from "@/types";
import { settingsService } from "@/services/settingsService";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Layers,
  CalendarCheck,
  Clock,
  Receipt,
  Wallet,
  CalendarOff,
  Award,
  CreditCard,
  BookOpen,
  BarChart3,
  Settings,
  Database,
  LogOut,
  School,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [setting, setSetting] = useState<SchoolSetting | null>(null);

  useEffect(() => {
    settingsService.getSettings().then((res) => {
      if (res.success && res.data) setSetting(res.data);
    });
  }, []);

  const role = user?.role || "Admin";

  const getNavItems = () => {
    switch (role) {
      case "Principal":
        return [
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { label: "Students Register", href: "/students", icon: GraduationCap },
          { label: "Staff & Teachers", href: "/teachers", icon: Users },
          { label: "Classes & Sections", href: "/classes", icon: Layers },
          { label: "Student Attendance", href: "/attendance", icon: CalendarCheck },
          { label: "Staff Attendance", href: "/staff-attendance", icon: Clock },
          { label: "Fee Summary", href: "/fees", icon: Receipt },
          { label: "Leave Approvals", href: "/leaves", icon: CalendarOff },
          { label: "Exams & Results", href: "/exams", icon: Award },
          { label: "Notices & Diary", href: "/diary", icon: BookOpen },
          { label: "System Reports", href: "/reports", icon: BarChart3 },
        ];
      case "Accountant":
        return [
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { label: "Fee Challans", href: "/fees", icon: Receipt },
          { label: "Staff Payroll", href: "/payroll", icon: Wallet },
          { label: "Expense Vouchers", href: "/expenses", icon: CreditCard },
          { label: "Financial Reports", href: "/reports", icon: BarChart3 },
        ];
      case "Teacher":
        return [
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { label: "My Students", href: "/students", icon: GraduationCap },
          { label: "Student Attendance", href: "/attendance", icon: CalendarCheck },
          { label: "Marks Entry", href: "/exams", icon: Award },
          { label: "Class Diary", href: "/diary", icon: BookOpen },
          { label: "Leave Requests", href: "/leaves", icon: CalendarOff },
          { label: "My Salary Slips", href: "/payroll", icon: Wallet },
        ];
      case "Admin":
      default:
        return [
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { label: "Students Register", href: "/students", icon: GraduationCap },
          { label: "Staff & Teachers", href: "/teachers", icon: Users },
          { label: "Classes & Sections", href: "/classes", icon: Layers },
          { label: "Student Attendance", href: "/attendance", icon: CalendarCheck },
          { label: "Staff Attendance", href: "/staff-attendance", icon: Clock },
          { label: "Fee Challans", href: "/fees", icon: Receipt },
          { label: "Staff Payroll", href: "/payroll", icon: Wallet },
          { label: "Leave Applications", href: "/leaves", icon: CalendarOff },
          { label: "Exams & Results", href: "/exams", icon: Award },
          { label: "Expense Accounts", href: "/expenses", icon: CreditCard },
          { label: "Notices & Diary", href: "/diary", icon: BookOpen },
          { label: "System Reports", href: "/reports", icon: BarChart3 },
          { label: "School Settings", href: "/settings", icon: Settings },
          { label: "Database Backup", href: "/backup", icon: Database },
        ];
    }
  };

  const navItems = getNavItems();

  const content = (
    <div className="flex flex-col h-full bg-white text-slate-700 font-sans text-xs border-r border-slate-200 shadow-xs">
      {/* School Brand Header */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-slate-900 truncate tracking-tight">
              {setting?.schoolName || "Al-Ilm Public High School"}
            </h1>
            <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
              {setting?.phone || "042-35123456"}
            </p>
          </div>
        </div>
      </div>

      {/* Role Pill Header */}
      <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>{role} Portal</span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          v2.0
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Card & Sign Out */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.name || "User"}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
