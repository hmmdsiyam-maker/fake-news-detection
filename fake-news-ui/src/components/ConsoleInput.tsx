"use client";

import React from "react";
import {
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Database
} from "lucide-react";
import { UserProfile } from "@/types";
import { GUEST_USAGE_LIMIT } from "@/constants/presets";

interface ConsoleInputProps {
  title: string;
  setTitle: (t: string) => void;
  loading: boolean;
  errorMsg: string | null;
  currentUser: UserProfile | null;
  guestCount: number;
  isDark?: boolean;
  onAnalyze: () => void;
  onClear: () => void;
  onLoadRandom?: () => void;
}

export const ConsoleInput: React.FC<ConsoleInputProps> = ({
  title,
  setTitle,
  loading,
  errorMsg,
  currentUser,
  guestCount,
  onAnalyze,
  onClear,
  onLoadRandom
}) => {
  const wordCount = title.trim().split(/\s+/).filter(Boolean).length;
  const charCount = title.length;
  const guestPassesLeft = Math.max(0, GUEST_USAGE_LIMIT - guestCount);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      onAnalyze();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xs transition-colors duration-200">
      {/* Streamlined Single Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
            Headline or News Claim
          </span>
          {wordCount > 0 && (
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
              {wordCount}w &bull; {charCount}c
            </span>
          )}
        </div>

        {onLoadRandom && (
          <button
            type="button"
            onClick={onLoadRandom}
            className="px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600 active:scale-95 shrink-0"
            title="Populate random news headline to verify"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Random News ↻</span>
          </button>
        )}
      </div>

      {/* Main Textarea */}
      <div className="space-y-1">
        <textarea
          rows={4}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type any news headline, statement, or claim to inspect..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 px-3.5 py-2.5 sm:py-3 text-sm leading-relaxed resize-y min-h-[96px] sm:min-h-[120px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
        />
      </div>

      {/* Action Controls: Side-by-side on mobile and desktop */}
      <div className="flex items-center gap-2 sm:gap-3 pt-0.5">
        <button
          type="button"
          onClick={onClear}
          disabled={loading || !title}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 min-h-[40px] sm:min-h-[42px]"
          title="Clear text"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading || !title.trim()}
          className="flex-1 min-h-[40px] sm:min-h-[42px] px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-sm shadow-indigo-600/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Verify News</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Compact Status & Quota Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
        {!currentUser ? (
          <div className="text-slate-600 dark:text-slate-400 font-sans flex items-center gap-1.5 flex-wrap">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Guest Mode:</span>
            <span>{guestPassesLeft} of {GUEST_USAGE_LIMIT} checks left</span>
          </div>
        ) : (
          <div className="text-emerald-700 dark:text-emerald-400 font-sans flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Database className="w-3 h-3 shrink-0" />
              <span className="truncate">
                @{currentUser.username} &bull; <strong className="uppercase font-semibold">{currentUser.subscription_tier || "free"}</strong>
              </span>
            </div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              Left: {currentUser.today_remaining && currentUser.today_remaining < 0 ? "Unlimited" : currentUser.today_remaining}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
