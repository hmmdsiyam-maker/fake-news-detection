"use client";

import React from "react";
import {
  CreditCard,
  X,
  CheckCircle2,
  Zap,
  Crown,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { SubscriptionPlan, UserProfile } from "@/types";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  currentUser: UserProfile | null;
  checkoutLoading: boolean;
  isDark?: boolean;
  onUpgradePlan: (planId: string) => void;
  onCancelSubscription: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  plans,
  currentUser,
  checkoutLoading,
  onUpgradePlan,
  onCancelSubscription
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 rounded-2xl shadow-xl relative overflow-y-auto transition-colors duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Subscription &amp; Verification Capacity
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                Stripe Gateway
              </span>
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Upgrade your truth verification quota &bull; Cancel anytime
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* PLAN 1: FREE STARTER */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
              !currentUser?.subscription_tier || currentUser?.subscription_tier === "free"
                ? "border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/30 dark:bg-indigo-950/20"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Starter
                </span>
                {(!currentUser?.subscription_tier || currentUser?.subscription_tier === "free") && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    Active
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  $0 <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">/ forever</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Essential verification for occasional readers.</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>100 Daily</strong> AI Verifications</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>PassiveAggressive NLP</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Last 50 Search History</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  <span>Standard Processing Speed</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              {!currentUser?.subscription_tier || currentUser?.subscription_tier === "free" ? (
                <div className="w-full py-2.5 rounded-xl font-medium text-xs bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-center">
                  Current Plan
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onCancelSubscription}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Downgrade to Free
                </button>
              )}
            </div>
          </div>

          {/* PLAN 2: PRO VERIFIER (RECOMMENDED) */}
          <div className="p-5 rounded-2xl border-2 border-indigo-500 bg-indigo-50/50 dark:bg-slate-950/90 shadow-md shadow-indigo-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-semibold tracking-wider uppercase shadow-xs">
              Recommended
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Pro Verifier
                </span>
                {currentUser?.subscription_tier === "pro" && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Active
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  $9.99 <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">/ month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">For journalists, analysts, and researchers.</p>
              </div>

              <div className="pt-3 border-t border-indigo-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                  <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span><strong>Unlimited Daily</strong> Verifications</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Sub-35ms Priority Queue</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Unlimited Raw SQL Audit History</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Personal REST API Access</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              {currentUser?.subscription_tier === "pro" ? (
                <div className="w-full py-2.5 rounded-xl font-semibold text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-center">
                  Active Tier
                </div>
              ) : (
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => onUpgradePlan("pro")}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Opening Stripe...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Upgrade to Pro ($9.99)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* PLAN 3: NEWSROOM ENTERPRISE */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
              currentUser?.subscription_tier === "enterprise"
                ? "border-purple-300 dark:border-purple-800/80 bg-purple-50/30 dark:bg-purple-950/20"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Enterprise
                </span>
                {currentUser?.subscription_tier === "enterprise" && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                    Active
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  $49.99 <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">/ month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">For digital newsrooms and editorial teams.</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span><strong>Multi-Seat</strong> Team Access</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>High-Throughput API (100 req/s)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Automated CMS Webhooks</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>99.98% Service Level SLA</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              {currentUser?.subscription_tier === "enterprise" ? (
                <div className="w-full py-2.5 rounded-xl font-semibold text-xs bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 text-center">
                  Active Tier
                </div>
              ) : (
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => onUpgradePlan("enterprise")}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Deploy Enterprise</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Secured with Stripe 256-bit TLS encryption &bull; Immediate activation</div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
