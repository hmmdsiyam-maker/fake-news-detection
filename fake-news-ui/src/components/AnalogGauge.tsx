"use client";

import React from "react";
import { PredictionResult } from "@/types";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface AnalogGaugeProps {
  result: PredictionResult | null;
  needleAngle: number;
  isDark?: boolean;
}

export const AnalogGauge: React.FC<AnalogGaugeProps> = ({
  result,
  needleAngle
}) => {
  return (
    <div className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 flex flex-col items-center shadow-xs transition-colors duration-200">
      {/* Precision Dial Face */}
      <div className="relative w-full max-w-[280px] h-[145px] overflow-hidden flex flex-col items-center">
        <svg
          viewBox="0 0 240 130"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Outer Base Arc */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Red / Fabricated Zone */}
          <path
            d="M 20 120 A 100 100 0 0 1 80 40"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Amber / Neutral Transition Zone */}
          <path
            d="M 80 40 A 100 100 0 0 1 160 40"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="6"
          />

          {/* Green / Authentic Zone */}
          <path
            d="M 160 40 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Calibrated Tick Marks */}
          <line x1="28" y1="110" x2="38" y2="105" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1.5" />
          <line x1="60" y1="62" x2="68" y2="70" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1.5" />
          <line x1="120" y1="20" x2="120" y2="30" className="stroke-slate-700 dark:stroke-slate-300" strokeWidth="2" />
          <line x1="180" y1="62" x2="172" y2="70" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1.5" />
          <line x1="212" y1="110" x2="202" y2="105" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1.5" />

          {/* Scale Labels */}
          <text x="22" y="128" fill="#f43f5e" fontSize="8" fontFamily="monospace" fontWeight="bold">
            FAKE
          </text>
          <text x="106" y="42" className="fill-slate-500 dark:fill-slate-400" fontSize="8" fontFamily="monospace" fontWeight="bold">
            NEUTRAL
          </text>
          <text x="195" y="128" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">
            REAL
          </text>
        </svg>

        {/* The Needle */}
        <div
          className="absolute bottom-0 w-1 h-[115px] origin-bottom transition-transform duration-700 ease-out z-10"
          style={{
            transform: `rotate(${needleAngle}deg)`,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
          }}
        >
          <div className="w-full h-full bg-gradient-to-t from-slate-700 via-indigo-600 to-indigo-400 rounded-t-full" />
        </div>

        {/* Pivot Center Cap */}
        <div className="absolute -bottom-3 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-md z-20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-indigo-600" />
        </div>
      </div>

      {/* Dual Indicators */}
      <div className="w-full grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 mt-3">
        <div
          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-mono transition-colors ${
            result?.label === 1
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold"
              : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${result?.label === 1 ? "text-rose-600 dark:text-rose-400" : "opacity-40"}`} />
          <span>Fabricated</span>
        </div>

        <div
          className={`flex items-center justify-end gap-2 p-2 rounded-xl border text-xs font-mono transition-colors ${
            result?.label === 0
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold"
              : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
          }`}
        >
          <span>Authentic</span>
          <CheckCircle2 className={`w-3.5 h-3.5 ${result?.label === 0 ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}`} />
        </div>
      </div>
    </div>
  );
};
