"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, RefreshCw } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAdmin } from "@/context/AdminContext";

export const AdminHeader: React.FC = () => {
  const { currentUser } = useApp();
  const { loading, refreshAll } = useAdmin();

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 sm:px-8 h-16 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs font-semibold"
          title="Back to Site"
        >
          <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Back to Site</span>
        </Link>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Shield className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </div>
          <span className="font-bold text-sm tracking-tight hidden sm:inline">Admin Dashboard</span>
          <span className="font-bold text-sm tracking-tight sm:hidden">Admin</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={refreshAll}
          disabled={loading}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Refresh dashboard data"
        >
          <RefreshCw className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <div className="flex items-center gap-2 pl-1 sm:pl-2 sm:border-l border-slate-200 dark:border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 hidden sm:block" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[80px] sm:max-w-none truncate">
            @{currentUser.username}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
};
