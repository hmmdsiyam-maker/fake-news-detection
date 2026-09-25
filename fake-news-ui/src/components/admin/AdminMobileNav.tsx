"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, FileText, BookOpen, CreditCard } from "lucide-react";

export const AdminMobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/admin/overview", icon: BarChart3 },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Logs", href: "/admin/logs", icon: FileText },
    { label: "Articles", href: "/admin/articles", icon: BookOpen },
    { label: "Payments", href: "/admin/payments", icon: CreditCard }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 pb-safe pt-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href === "/admin/overview" && pathname === "/admin");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive && item.label === "Overview" ? "animate-bounce" : ""}`} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
