"use client";

import React from "react";
import { Copy, Check, Database, CheckCircle2, AlertTriangle } from "lucide-react";
import { PredictionResult, UserProfile } from "@/types";
import { GUEST_USAGE_LIMIT } from "@/constants/presets";

interface VerdictCardProps {
  result: PredictionResult | null;
  latency: number | null;
  currentUser: UserProfile | null;
  guestCount: number;
  copied: boolean;
  isDark?: boolean;
  onCopyResult: () => void;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  result,
  latency,
  currentUser,
  guestCount,
  copied,
  onCopyResult
}) => {
  const guestPassesLeft = Math.max(0, GUEST_USAGE_LIMIT - guestCount);

  if (!result) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center font-mono text-xs bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400">
        <div className="text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
          AWAITING ARTICLE TELEMETRY
        </div>
        <p className="text-[11px]">
          Enter an article headline or body text on the left console and click &quot;Analyze Article&quot; to inspect ML classification markers.
        </p>
      </div>
    );
  }

  const isReal = result.label === 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div
        className={`p-4 sm:p-6 rounded-2xl border shadow-xs transition-colors duration-200 ${
          isReal
            ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/25"
            : "border-rose-300 dark:border-rose-800/80 bg-rose-50/60 dark:bg-rose-950/25"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono tracking-wider uppercase font-bold text-slate-500 dark:text-slate-400">
                Official Verdict
              </span>
              {result.saved_to_history && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Saved to DB
                </span>
              )}
              {!currentUser && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  Guest: {guestPassesLeft} Remaining
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 mt-1.5">
              {isReal ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <h3
                className={`text-2xl font-black tracking-tight uppercase font-mono ${
                  isReal
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-rose-800 dark:text-rose-300"
                }`}
              >
                {isReal ? "Verified Authentic" : "Fabricated / Fake"}
              </h3>
            </div>
          </div>

          <div
            className={`w-full sm:w-auto px-3 py-1.5 sm:py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border text-center ${
              isReal
                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                : "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700"
            }`}
          >
            {result.confidence.toFixed(1)}% Match
          </div>
        </div>

        <p className="mt-4 sm:mt-3 text-sm sm:text-xs font-sans leading-relaxed text-slate-700 dark:text-slate-300 max-w-2xl">
          {isReal
            ? "Article exhibits semantic coherence, verified factual cadence, and lexical distributions conforming to credible journalism."
            : "Article exhibits high-frequency sensationalist markers, exaggerated adjectives, and syntactic cues indicative of disinformation."}
        </p>

        {/* Metrics Strip */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xs">
            <div className="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
              Confidence Score
            </div>
            <div
              className={`text-lg font-bold font-mono mt-0.5 ${
                isReal
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-rose-700 dark:text-rose-400"
              }`}
            >
              {result.confidence.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xs">
            <div className="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
              Inference Latency
            </div>
            <div className="text-lg font-bold font-mono mt-0.5 text-indigo-700 dark:text-indigo-400">
              {latency ? `${latency} ms` : "< 25 ms"}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xs flex flex-col justify-between">
            <div className="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
              Model Engine
            </div>
            <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
              PassiveAggressive (80k)
            </div>
          </div>
        </div>

        {/* Top Keywords Strip */}
        {result.top_keywords && result.top_keywords.length > 0 && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40">
            <div className="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
              Extracted Signal Keywords
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.top_keywords.map((kw, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded-md text-xs font-medium border ${
                    isReal
                      ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tactile Copy Button Strip */}
        <div className="mt-4 pt-4 sm:pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Audit Hinge Loss &bull; Calibrated Margins
          </span>
          <button
            type="button"
            onClick={onCopyResult}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[auto] px-3.5 py-2.5 sm:py-1.5 rounded-lg text-sm sm:text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Audit Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
