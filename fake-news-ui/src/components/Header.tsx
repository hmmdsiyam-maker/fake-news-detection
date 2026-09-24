"use client";

import React from "react";
import {
  ShieldCheck,
  User,
  History,
  BarChart3,
  LogOut,
  LogIn,
  Sun,
  Moon,
  CreditCard,
  Zap,
  Crown
} from "lucide-react";
import { UserProfile } from "@/types";
import { GUEST_USAGE_LIMIT } from "@/constants/presets";

interface HeaderProps {
  theme: "dark" | "white";
  setTheme: (t: "dark" | "white") => void;
  apiOnline: boolean | null;
  currentUser: UserProfile | null;
  guestCount: number;
  historyCount: number;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  apiOnline,
  currentUser,
  guestCount,
  historyCount,
  onOpenAuth,
  onOpenPricing,
  onOpenHistory,
  onOpenAdmin,
  onLogout
}) => {
  const isDark = theme === "dark";
  const guestPassesLeft = Math.max(0, GUEST_USAGE_LIMIT - guestCount);

  return (
    <header
      className={`w-full border-b transition-colors ${
        isDark
          ? "bg-[#0d121c] border-black/80 shadow-[0_2px_10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "bg-[#f8fafc] border-slate-300 shadow-[0_2px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Console Title */}
        <div className="flex items-center gap-3.5">
          <div className="skeuo-screw hidden sm:block" />

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border-t border-b flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-gradient-to-b from-[#2a3447] to-[#141b27] border-white/20 border-b-black/80 shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "bg-gradient-to-b from-[#ffffff] to-[#e2e8f0] border-white border-b-slate-300 shadow-[0_3px_6px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
              }`}
            >
              <ShieldCheck className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
            </div>

            <div>
              <h1
                className={`text-base font-extrabold tracking-wider uppercase ${
                  isDark
                    ? "text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                    : "text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                }`}
              >
                Truth Console{" "}
                <span
                  className={`text-xs font-semibold tracking-widest ml-1 opacity-90 ${
                    isDark ? "text-indigo-400" : "text-indigo-600"
                  }`}
                >
                  // AI VERIFIER
                </span>
              </h1>
              <div className={`text-[11px] tracking-wide font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                ANALOG TELEMETRY &bull; POSTGRESQL DB
              </div>
            </div>
          </div>
        </div>

        {/* Controls: Auth, Daily Quota, Pricing, History, Admin, Theme Switch & Status Lamp */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* User Tag */}
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${
                  isDark
                    ? "bg-[#0b0f19] border-black/80 text-slate-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
                    : "bg-slate-100 border-slate-300 text-slate-700 shadow-inner"
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">@{currentUser.username}</span>
                {currentUser.role === "admin" && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                    ADMIN
                  </span>
                )}
              </div>

              {/* Subscription Tier & Daily Quota Badge */}
              {currentUser.subscription_tier === "pro" ? (
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-sm"
                  title="Pro Subscriber - Unlimited Verifications. Click to manage plan."
                >
                  <Crown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PRO (UNLIMITED)</span>
                </button>
              ) : currentUser.subscription_tier === "enterprise" ? (
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 hover:border-purple-400 transition-all cursor-pointer shadow-sm"
                  title="Enterprise Subscriber - Newsroom Level. Click to manage."
                >
                  <Crown className="w-3.5 h-3.5 text-purple-400" />
                  <span>ENTERPRISE</span>
                </button>
              ) : (
                /* Free Tier User: Show 20 Daily Checks Remaining and Upgrade Button */
                <div className="flex items-center gap-1.5">
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border ${
                      (currentUser.today_remaining ?? (20 - (currentUser.today_count || 0))) > 0
                        ? isDark
                          ? "bg-[#0b0f19] border-slate-800 text-slate-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
                          : "bg-slate-100 border-slate-300 text-slate-700 shadow-inner"
                        : isDark
                        ? "bg-red-950/40 border-red-500/40 text-red-400 animate-pulse"
                        : "bg-red-50 border-red-300 text-red-700"
                    }`}
                    title="Free accounts receive 20 news verifications per day (resets 00:00 UTC)"
                  >
                    <span className="text-[10px] text-slate-500 hidden sm:inline">DAILY:</span>
                    <span
                      className={
                        (currentUser.today_remaining ?? (20 - (currentUser.today_count || 0))) > 0
                          ? "text-sky-400 font-extrabold"
                          : "text-red-400 font-extrabold"
                      }
                    >
                      {Math.max(
                        0,
                        currentUser.today_remaining !== undefined && currentUser.today_remaining !== null
                          ? currentUser.today_remaining
                          : 20 - (currentUser.today_count || 0)
                      )}{" "}
                      / 20
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenPricing}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-sm hover:shadow-orange-500/20 transition-all cursor-pointer"
                    title="Upgrade to Pro with Stripe for Unlimited Verifications"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">UPGRADE</span>
                  </button>
                </div>
              )}

              {/* History Button */}
              <button
                type="button"
                onClick={onOpenHistory}
                className={`skeuo-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                  isDark ? "text-sky-300" : "text-sky-700 border border-slate-200"
                }`}
                title="View your personal search history stored in PostgreSQL"
              >
                <History className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">HISTORY</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-800"
                  }`}
                >
                  {historyCount}
                </span>
              </button>

              {/* Admin Telemetry Button */}
              {currentUser.role === "admin" && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className={`skeuo-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                    isDark ? "text-amber-300" : "text-amber-700 border border-slate-200"
                  }`}
                  title="Open Administrator Management & Telemetry Console"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">ADMIN</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className={`skeuo-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer ${
                  isDark ? "text-red-400" : "text-red-600 border border-slate-200"
                }`}
                title="Sign out of console"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EXIT</span>
              </button>
            </div>
          ) : (
            /* Non-Logged In User Section */
            <div className="flex items-center gap-2">
              <div
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border flex items-center gap-1.5 ${
                  guestPassesLeft > 0
                    ? isDark
                      ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                      : "bg-amber-50 text-amber-800 border-amber-300"
                    : isDark
                    ? "bg-red-950/60 text-red-400 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse"
                    : "bg-red-50 text-red-700 border-red-300"
                }`}
                title="Non-logged in guests receive 5 free analyses before login is required"
              >
                <span>GUEST:</span>
                <span className="font-extrabold">
                  {guestPassesLeft} / {GUEST_USAGE_LIMIT} LEFT
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenPricing}
                className={`skeuo-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer ${
                  isDark ? "text-amber-400" : "text-amber-700 border border-slate-200"
                }`}
                title="View Subscription Plans & Pricing"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">PLANS</span>
              </button>

              <button
                type="button"
                onClick={onOpenAuth}
                className={`skeuo-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                  isDark ? "text-indigo-300" : "text-indigo-700 border border-slate-200"
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>SIGN IN</span>
              </button>
            </div>
          )}

          {/* Theme Rocker Switch */}
          <div
            className={`flex items-center p-1 rounded-xl border ${
              isDark
                ? "bg-[#090c13] border-black/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]"
                : "bg-slate-200/80 border-slate-300 shadow-[inset_0_2px_4px_rgba(15,23,42,0.1)]"
            }`}
          >
            <button
              type="button"
              onClick={() => setTheme("white")}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                !isDark
                  ? "bg-white text-slate-800 shadow-[0_2px_4px_rgba(15,23,42,0.15),inset_0_1px_0_rgba(255,255,255,1)] border border-slate-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Switch to White Mode"
            >
              <Sun className={`w-3.5 h-3.5 ${!isDark ? "text-amber-500" : "text-slate-500"}`} />
              <span className="hidden sm:inline">WHITE</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isDark
                  ? "bg-[#1e2430] text-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] border border-white/10"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Switch to Dark Mode"
            >
              <Moon className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-slate-500"}`} />
              <span className="hidden sm:inline">DARK</span>
            </button>
          </div>

          {/* Physical Status Lamp */}
          <div
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border ${
              isDark
                ? "bg-[#080b12] border-t-black border-b-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)]"
                : "bg-white border-slate-200 shadow-[inset_0_1px_3px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,1)]"
            }`}
          >
            <div className="skeuo-jewel-collar">
              <div className={apiOnline === true ? "skeuo-jewel-led-green" : "skeuo-jewel-led-red"} />
            </div>
            <span
              className={`text-[11px] font-mono font-semibold tracking-wider hidden sm:inline ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {apiOnline === true ? "READY" : apiOnline === false ? "OFFLINE" : "WAIT..."}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
