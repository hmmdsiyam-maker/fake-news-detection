"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Sun,
  Moon,
  LogOut,
  History,
  LayoutDashboard,
  ChevronDown,
  Menu,
  X,
  CreditCard
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    setTheme,
    isDark,
    apiOnline,
    currentUser,
    logout,
    setAuthModalOpen,
    setPricingModalOpen,
    setHistoryModalOpen
  } = useApp();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/console", label: "Verify News" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/docs", label: "Docs" },
    { href: "/pricing", label: "Pricing" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:border-indigo-300 dark:group-hover:border-indigo-600">
              <Shield className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Veritas
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: System Indicator, Theme Switch & User Account */}
        <div className="flex items-center gap-2.5">
          {/* Live Status Indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400"
            title={apiOnline ? "AI Service is active" : "AI Service offline"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiOnline === true
                  ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                  : apiOnline === false
                  ? "bg-rose-500 shadow-xs shadow-rose-500/50"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-[11px]">
              {apiOnline ? "Ready" : "Offline"}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "white" : "dark")}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
            title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* User Account / Sign In */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs text-xs font-medium transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-700 dark:text-white font-semibold uppercase">
                  {currentUser.username.charAt(0)}
                </div>
                <span>{currentUser.username}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                    currentUser.subscription_tier !== "free"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {currentUser.subscription_tier || "Free"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100 z-50">
                  <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800/60 text-[11px]">
                    <div className="text-slate-500 dark:text-slate-400">Signed in as</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{currentUser.email}</div>
                    
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Plan Name</span>
                        <span className={`font-bold uppercase ${currentUser.subscription_tier !== "free" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}>
                          {currentUser.subscription_tier === "pro" ? "Pro Verifier" : currentUser.subscription_tier === "enterprise" ? "Enterprise" : "Free Starter"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Daily Limit</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200">{currentUser.daily_limit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Remaining</span>
                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {currentUser.today_remaining && currentUser.today_remaining < 0 ? "∞" : currentUser.today_remaining}
                        </span>
                      </div>
                      
                      {currentUser.subscription_tier !== "free" && currentUser.subscription_start_date && (
                        <>
                          <div className="pt-1.5 mt-1.5 border-t border-slate-200 dark:border-slate-700/50"></div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-slate-400">Started</span>
                            <span className="font-mono text-slate-600 dark:text-slate-300">
                              {new Date(currentUser.subscription_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {currentUser.subscription_end_date && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 dark:text-slate-400">Renews/Expires</span>
                              <span className="font-mono text-slate-600 dark:text-slate-300">
                                {new Date(currentUser.subscription_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setHistoryModalOpen(true);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Check History</span>
                    </button>

                    {currentUser.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-xs cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {currentUser?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
