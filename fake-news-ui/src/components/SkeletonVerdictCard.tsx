"use client";

import React from "react";

export const SkeletonVerdictCard: React.FC = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 shadow-xs relative overflow-hidden">
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 dark:via-slate-800/30 to-transparent" />
        
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        <div className="mt-4 space-y-2 relative z-10">
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>

        {/* Metrics Strip Skeleton */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 h-16 flex flex-col justify-between">
               <div className="h-2 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
               <div className="h-5 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
