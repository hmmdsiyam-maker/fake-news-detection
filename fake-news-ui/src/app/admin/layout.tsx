"use client";

import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AdminProvider } from "@/context/AdminContext";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, setAuthModalOpen } = useApp();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
        <div className="w-full max-w-md p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">Admin Privileges Required</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This dashboard is restricted to administrator accounts. Please sign in with administrator credentials.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            {!currentUser ? (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
              >
                Sign In to Admin
              </button>
            ) : null}
            <Link
              href="/"
              className="w-full py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-center"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
          <AdminHeader />
          <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden relative">
            <AdminMobileNav />
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-6 pb-24 md:pb-8 w-full max-w-full">
              {children}
            </main>
          </div>
        </div>
      </AdminProvider>
    </AdminAuthGuard>
  );
}
