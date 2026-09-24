"use client";

import React from "react";
import { Sparkles, X } from "lucide-react";

interface NotificationToastProps {
  message: string | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
      <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
      <div className="flex-1 text-xs">
        <div className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider font-mono mb-1">
          Notification
        </div>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
