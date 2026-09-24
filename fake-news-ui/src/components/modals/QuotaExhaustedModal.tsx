"use client";

import React from "react";
import { AlertTriangle, X, Zap } from "lucide-react";

interface QuotaExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradePro: () => void;
  onOpenPricing: () => void;
  checkoutLoading: boolean;
  isDark?: boolean;
}

export const QuotaExhaustedModal: React.FC<QuotaExhaustedModalProps> = ({
  isOpen,
  onClose,
  onUpgradePro,
  onOpenPricing,
  checkoutLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 p-6 rounded-2xl shadow-xl relative text-center transition-colors duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
          Daily Verification Limit Reached (20/20)
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          You have completed all <strong className="font-semibold text-slate-900 dark:text-white">20 free news verifications</strong> allocated
          for your account today. Your daily limit automatically resets every 24 hours at 00:00 UTC.
        </p>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onUpgradePro}
            disabled={checkoutLoading}
            className="w-full py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Upgrade to Pro — Unlimited ($9.99/mo)</span>
          </button>

          <button
            type="button"
            onClick={onOpenPricing}
            className="w-full py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            View All Subscription Plans
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer pt-1"
          >
            I will wait for tomorrow&apos;s reset
          </button>
        </div>
      </div>
    </div>
  );
};
