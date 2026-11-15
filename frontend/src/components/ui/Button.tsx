"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs gap-2",
    lg: "px-5 py-2.5 text-sm gap-2.5",
  };

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs shadow-blue-500/25 border border-blue-600",
    secondary: "bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 font-medium",
    danger: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border border-rose-600 shadow-xs",
    success: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-600 shadow-xs",
    outline: "border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 bg-white font-medium shadow-xs",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
