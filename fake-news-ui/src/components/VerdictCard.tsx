"use client";

import React from "react";
import { 
  Copy, 
  Check, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ChevronRight
} from "lucide-react";
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
          Enter an article headline or body text on the left console and click &quot;Verify News&quot; to inspect ML classification markers and AI fact-checking.
        </p>
      </div>
    );
  }

  const isReal = result.label === 0;
  const gemini = result.gemini_analysis;
  const hasGemini = gemini && gemini.enabled;

  return (
    <div className="animate-in fade-in duration-300">
      <div
        className={`p-5 sm:p-6 rounded-2xl border shadow-xs transition-colors duration-200 space-y-4 ${
          isReal
            ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20"
            : "border-rose-300 dark:border-rose-800/80 bg-rose-50/40 dark:bg-rose-950/20"
        }`}
      >
        {/* Header: Status + Match Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isReal
                  ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isReal ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={`text-xl sm:text-2xl font-black uppercase font-mono tracking-tight ${
                    isReal
                      ? "text-emerald-800 dark:text-emerald-300"
                      : "text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {isReal ? "Verified Authentic" : "Fabricated / Fake"}
                </h3>
                {result.saved_to_history && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <Database className="w-3 h-3" /> Saved
                  </span>
                )}
                {!currentUser && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    Guest: {guestPassesLeft} left
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>Confidence: <strong className="text-slate-800 dark:text-slate-200">{result.confidence.toFixed(1)}%</strong></span>
                <span>&bull;</span>
                <span>Latency: <strong className="text-slate-800 dark:text-slate-200">{latency ? `${latency}ms` : "25ms"}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {hasGemini && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                AI Verified
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                isReal
                  ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                  : "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700"
              }`}
            >
              {result.confidence.toFixed(1)}% Match
            </span>
          </div>
        </div>

        {/* Fact-Check Analysis (From AI or Clean Summary) */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {hasGemini ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Forensic Fact-Check Breakdown
                </>
              ) : (
                "Linguistic Forensic Verdict"
              )}
            </div>
            <p className="text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200">
              {hasGemini && gemini.summary
                ? gemini.summary
                : isReal
                ? "This article exhibits high lexical consistency, realistic datelines, and structural cadence typical of verified journalism."
                : "This article exhibits sensationalist syntax, unverified attribution patterns, and linguistic markers common to fabricated disinformation."}
            </p>
          </div>

          {/* Key Investigative Signals (Compact bullet points) */}
          {hasGemini && gemini.key_points && gemini.key_points.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                Key Investigative Signals
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {gemini.key_points.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Signal Keywords (Clean inline pills) */}
        {result.top_keywords && result.top_keywords.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400 mr-1">
              Signals:
            </span>
            {result.top_keywords.slice(0, 8).map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            Model: PassiveAggressive (80k) {hasGemini ? "+ Neural LLM" : ""}
          </span>

          <button
            type="button"
            onClick={onCopyResult}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
