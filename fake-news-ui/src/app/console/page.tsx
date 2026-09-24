"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";

import { PredictionResult } from "@/types";
import { getRandomSample, GUEST_USAGE_LIMIT, DAILY_FREE_LIMIT } from "@/constants/presets";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";

import { Navbar } from "@/components/Navbar";
import { ConsoleInput } from "@/components/ConsoleInput";
import { AnalogGauge } from "@/components/AnalogGauge";
import { VerdictCard } from "@/components/VerdictCard";
import { SkeletonVerdictCard } from "@/components/SkeletonVerdictCard";
import { SiteFooter } from "@/components/SiteFooter";

export default function ConsolePage() {
  const {
    isDark,
    token,
    currentUser,
    guestCount,
    incrementGuestCount,
    setAuthModalOpen,
    setQuotaModalOpen,
    showToast,
    refreshUser
  } = useApp();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Single Random News Selection
  const handleLoadRandomNews = () => {
    const preset = getRandomSample(title);
    setTitle(preset.title);
    setText(preset.text);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setTitle("");
    setText("");
    setResult(null);
    setLatency(null);
    setErrorMsg(null);
  };

  // Run Inference Analysis
  const handleAnalyze = async () => {
    if (!title.trim() && !text.trim()) {
      setErrorMsg("Please enter a headline or article text to check.");
      return;
    }

    // Guest enforcement
    if (!token && guestCount >= GUEST_USAGE_LIMIT) {
      setAuthModalOpen(true);
      showToast("Guest limit of 5 checks reached. Please sign in to continue.", "info");
      return;
    }

    // Free user daily quota check
    if (token && currentUser) {
      const isPaid = currentUser.subscription_tier && currentUser.subscription_tier !== "free";
      const count = currentUser.today_count || currentUser.today_prediction_count || 0;
      if (!isPaid && count >= DAILY_FREE_LIMIT) {
        setQuotaModalOpen(true);
        return;
      }
    }

    setLoading(true);
    setErrorMsg(null);
    const start = performance.now();

    try {
      const data = await api.predict(title, text, token);
      const elapsed = Math.round(performance.now() - start);

      setResult(data);
      setLatency(data.latency_ms || elapsed);

      const isReal = data.prediction === "Real News" || data.prediction === "REAL";
      if (isReal && data.confidence >= 80) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#6366f1"]
        });
      }

      if (!token) {
        incrementGuestCount();
      } else {
        refreshUser();
      }
    } catch (err: unknown) {
      const errObj = err as { status?: number; message?: string };
      if (errObj.status === 429) {
        if (!token) {
          setAuthModalOpen(true);
        } else {
          setQuotaModalOpen(true);
        }
      }
      setErrorMsg(errObj.message || "Could not connect to model server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const report = `[VERITAS VERIFICATION RESULT]\nHeadline: ${title || "N/A"}\nVerdict: ${result.prediction}\nConfidence: ${result.confidence}%\nTime: ${new Date().toLocaleString()}\nModel: PassiveAggressive Classifier`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    showToast("Report copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const getDialAngle = (): number => {
    if (!result) return 0;
    const isFake = result.prediction === "Fake News" || result.prediction === "FAKE";
    if (isFake) {
      return -(result.confidence * 0.75);
    } else {
      return result.confidence * 0.75;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Workspace Title & Controls */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              News Verifier
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Check news articles and headlines with AI in real-time.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleLoadRandomNews}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Load a random news sample to test"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Random News ↻</span>
            </button>
          </div>
        </div>

        {/* Clean Workbench Chassis */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 shadow-xs transition-colors overflow-hidden">
          {/* Subheader */}
          <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>AI Model: PassiveAggressive Classifier (Fast Online Learning)</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Sub-second response
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* Split: Form (Left) & Dial (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <ConsoleInput
                  title={title}
                  setTitle={setTitle}
                  text={text}
                  setText={setText}
                  loading={loading}
                  errorMsg={errorMsg}
                  currentUser={currentUser}
                  guestCount={guestCount}
                  isDark={isDark}
                  onAnalyze={handleAnalyze}
                  onClear={handleClear}
                  onLoadRandom={handleLoadRandomNews}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col items-center">
                <AnalogGauge
                  result={result}
                  needleAngle={getDialAngle()}
                  isDark={isDark}
                />

                {/* Diagnostics Panel */}
                <div className="w-full mt-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs text-xs space-y-2.5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400">Response Time:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {latency ? `${latency} ms` : "Ready"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400">Confidence Score:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                      {result ? `${result.confidence}%` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">History Storage:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {token ? "Saved to your account" : "Temporary (Guest)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verdict Display */}
            {(loading || result) && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                {loading ? (
                  <SkeletonVerdictCard />
                ) : (
                  result && (
                    <VerdictCard
                      result={result}
                      latency={latency}
                      currentUser={currentUser}
                      guestCount={guestCount}
                      copied={copied}
                      isDark={isDark}
                      onCopyResult={handleCopyReport}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
