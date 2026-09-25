"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, FileText, BookOpen, CreditCard } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { users, logs, blogs, payments } = useAdmin();

  const navItems = [
    {
      label: "Overview & Metrics",
      href: "/admin/overview",
      icon: BarChart3,
      badge: null
    },
    {
      label: "User Accounts",
      href: "/admin/users",
      icon: Users,
      badge: users.length
    },
    {
      label: "Verification Logs",
      href: "/admin/logs",
      icon: FileText,
      badge: logs.length
    },
    {
      label: "Research Articles",
      href: "/admin/articles",
      icon: BookOpen,
      badge: blogs.length
    },
    {
      label: "Payments & Revenue",
      href: "/admin/payments",
      icon: CreditCard,
      badge: payments.length
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-4 shrink-0 overflow-y-auto z-10">
      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          Menu
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/admin/overview" && pathname === "/admin");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
