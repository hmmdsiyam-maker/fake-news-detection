"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  History,
  FileCheck2,
  Lock,
  Sparkles
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  const features = [
    {
      title: "Real-Time AI Verification",
      desc: "Instant fake news and clickbait detection powered by machine learning.",
      icon: Zap
    },
    {
      title: "Confidence & Authenticity Scores",
      desc: "Clear percentage probability showing how closely text matches verified news sources.",
      icon: BarChart3
    },
    {
      title: "Personal History & Search Log",
      desc: "Keep a complete history of checked articles securely stored in your personal account.",
      icon: History
    },
    {
      title: "Private & Secure Checking",
      desc: "Check headlines and full articles without sharing your private notes or searches.",
      icon: Lock
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Paste Headline or Article",
      desc: "Enter any news headline, social post, or full article text into the verifier."
    },
    {
      step: "02",
      title: "AI Analyzes Linguistic Patterns",
      desc: "The model inspects vocabulary, sensationalist phrasing, and semantic structure."
    },
    {
      step: "03",
      title: "Get an Instant Verdict",
      desc: "Receive an immediate Authentic or Fake verdict with confidence percentage."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Clean Hero Section */}
      <section className="pt-20 pb-20 md:pt-28 md:pb-28 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI-Powered News Verification</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 text-balance leading-[1.15]">
            Detect Fake News with AI in Seconds.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed text-balance">
            Verify breaking news articles, viral social media claims, and suspicious headlines with fast, accurate machine learning.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <Link
              href="/console"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98] shadow-sm shadow-indigo-600/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Verifying Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/about"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              How It Works
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>98.4% Benchmark Accuracy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Instant Sub-Second Results</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>20 Free Daily Checks</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: 3 Simple Steps */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-semibold uppercase font-mono text-indigo-600 dark:text-indigo-400">
            Simple Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            How Veritas Checks News
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Three simple steps to verify whether a news story is genuine or fabricated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs space-y-3"
            >
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                STEP {s.step}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {s.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <div className="text-xs font-semibold uppercase font-mono text-indigo-600 dark:text-indigo-400">
              Platform Features
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Built for Fact-Checkers and Everyday Readers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Everything you need to combat online misinformation with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ready to Check a News Story?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Get started right away with 5 free guest checks or create a free account for 20 daily verifications and saved history.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/console"
              className="px-6 py-3 rounded-xl text-xs font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98] shadow-sm shadow-indigo-600/30"
            >
              Open News Verifier
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
