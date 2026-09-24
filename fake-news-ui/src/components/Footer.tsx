"use client";

import React from "react";

interface FooterProps {
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDark }) => {
  return (
    <footer
      className={`mt-auto border-t py-4 text-center text-xs font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
        isDark
          ? "border-black/80 bg-[#090c13] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "border-slate-300 bg-[#f8fafc] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
          <span className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            AI TRUTH CONSOLE // ACTIVE
          </span>
        </div>
        <div>PASSIVE-AGGRESSIVE NLP CLASSIFIER &bull; POSTGRESQL DB</div>
      </div>
    </footer>
  );
};
