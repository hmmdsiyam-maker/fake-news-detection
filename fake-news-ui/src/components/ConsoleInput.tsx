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
  text: string;
  setText: (t: string) => void;
  loading: boolean;
  errorMsg: string | null;
  currentUser: UserProfile | null;
  guestCount: number;
  isDark?: boolean;
  onAnalyze: () => void;
  onClear: () => void;
  onLoadRandom: () => void;
}

export const ConsoleInput: React.FC<ConsoleInputProps> = ({
  title,
  setTitle,
  text,
  setText,
  loading,
  errorMsg,
  currentUser,
  guestCount,
  onAnalyze,
  onClear,
  onLoadRandom
}) => {
  const wordCount = (title + " " + text).trim().split(/\s+/).filter(Boolean).length;
  const charCount = (title + " " + text).length;
  const guestPassesLeft = Math.max(0, GUEST_USAGE_LIMIT - guestCount);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      onAnalyze();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-7 space-y-6 shadow-xs transition-colors duration-200">
      {/* Header & Single Random News Option */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Article Input
          </span>
        </div>

        {/* Single Random News Button */}
        <div>
          <button
            type="button"
            onClick={onLoadRandom}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Load a random news article to test"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Random News ↻</span>
          </button>
        </div>
      </div>

      {/* Headline / Title Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Headline or Claim
          </label>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Optional
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type article headline..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 sm:py-3 text-base sm:text-sm font-sans text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
        />
      </div>

      {/* Article Body Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Article Text
          </label>
          <div className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
            {wordCount} words &bull; {charCount} chars
          </div>
        </div>
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste complete article text or paragraphs here to inspect for fake news and misleading claims..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-base sm:text-sm font-sans leading-relaxed resize-y min-h-[140px] sm:min-h-[180px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
        />
      </div>

      {/* Action Controls */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <button
          type="button"
          onClick={onClear}
          disabled={loading || (!title && !text)}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[11px] hidden sm:inline text-slate-400 dark:text-slate-500 shrink-0">
            Ctrl + Enter
          </span>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={loading || (!title && !text)}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-sm shadow-indigo-600/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Checking Article...</span>
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
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Status & Quota Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        {!currentUser ? (
          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Guest Mode:</span>{" "}
            {guestPassesLeft} of {GUEST_USAGE_LIMIT} free checks remaining. Sign in for daily quota and saved history.
          </div>
        ) : (
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-sans flex flex-col sm:flex-row sm:items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>
                Signed in as <strong className="font-semibold">@{currentUser.username}</strong> &bull; Plan:{" "}
                <strong className="uppercase">{currentUser.subscription_tier || "free"}</strong>
              </span>
            </div>
            <span className="hidden sm:inline">&bull;</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-500">
              Daily Checks Left: {currentUser.today_remaining && currentUser.today_remaining < 0 ? "Unlimited" : currentUser.today_remaining}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
