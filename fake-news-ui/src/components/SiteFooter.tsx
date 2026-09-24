"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs transition-colors duration-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
          {/* Brand & Statement */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 group-hover:border-indigo-300 dark:group-hover:border-indigo-600 transition-colors">
                <Shield className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Veritas
              </span>
            </Link>
            <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-400">
              High-throughput machine learning disinformation detection and cryptographic verification telemetry.
            </p>
          </div>

          {/* Platform */}
          <div>
            <div className="font-semibold text-xs mb-3 text-slate-900 dark:text-slate-100">
              Platform
            </div>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/console" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Truth Workstation
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  REST API Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Research */}
          <div>
            <div className="font-semibold text-xs mb-3 text-slate-900 dark:text-slate-100">
              Research
            </div>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Methodology &amp; Bounds
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Research Journal
                </Link>
              </li>
              <li>
                <Link href="/about#ethics" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Neutrality Principles
                </Link>
              </li>
            </ul>
          </div>

          {/* Engine Architecture */}
          <div>
            <div className="font-semibold text-xs mb-3 text-slate-900 dark:text-slate-100">
              Architecture
            </div>
            <ul className="space-y-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <li>PassiveAggressive Classifier</li>
              <li>TF-IDF 80k-Feature Projection</li>
              <li>PostgreSQL Raw SQL Engine</li>
              <li>Sub-35ms Average Latency</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Veritas Intelligence Systems. Designed for information integrity.
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span>v2.4.0</span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
