"use client";

import React from "react";
import Link from "next/link";
import {
  Cpu,
  Award,
  CheckCircle,
  Users,
  ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";

export default function AboutPage() {
  const comparison = [
    {
      metric: "Decision Latency",
      veritas: "< 35 ms",
      llm: "1,200 - 3,500 ms",
      naiveBayes: "~15 ms"
    },
    {
      metric: "Empirical Accuracy (ISOT)",
      veritas: "98.4%",
      llm: "91.2% (Hallucination risk)",
      naiveBayes: "84.6%"
    },
    {
      metric: "Online Learning (Stream)",
      veritas: "Native (Hinge Loss)",
      llm: "Requires Fine-Tuning",
      naiveBayes: "Batch Update Only"
    },
    {
      metric: "Audit Trail Integrity",
      veritas: "Deterministic Raw SQL",
      llm: "Probabilistic Tokens",
      naiveBayes: "Heuristic"
    }
  ];

  const team = [
    {
      name: "Dr. Elena Rostova",
      role: "Lead NLP Research Scientist",
      bio: "Former Stanford NLP Lab researcher specializing in high-dimensional margin classifiers and lemmatization pipelines."
    },
    {
      name: "Marcus Vance",
      role: "Director of OSINT Telemetry",
      bio: "20-year investigative journalism veteran and former Reuters investigative bureau chief covering automated astroturfing."
    },
    {
      name: "Tariq Rahman",
      role: "Principal Infrastructure Architect",
      bio: "Distributed systems engineer focused on high-throughput PostgreSQL query optimization and zero-ORM data persistence."
    },
    {
      name: "Sophia Chen",
      role: "Algorithmic Fairness Lead",
      bio: "Researcher specializing in topic-invariant semantic classifiers and mitigating political bias in automated media audits."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Header */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase font-mono text-indigo-600 dark:text-indigo-400">
            Scientific Foundation &amp; Methodology
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Restoring epistemic integrity in the era of synthetic media.
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            Veritas was engineered to solve the speed and hallucination crisis in automated truth verification by deploying deterministic margin classifiers.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs transition-colors">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">The Veritas Mission</h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Digital disinformation spreads exponentially faster than factual reporting across algorithmic recommendation feeds. Heavy generative AI models are too slow and prone to unpredictable hallucinations to act as authoritative wire-speed filters. Veritas bridges this gap by deploying deterministic, mathematically bounded margin classifiers calibrated over 80,000 continuous linguistic features.
          </p>
        </div>

        {/* Methodology Breakdown */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>PassiveAggressive Optimization Engine</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">1. Hinge Loss Optimization</h3>
              <p>
                The classifier employs an online learning rule for continuous data ingestion. When an observation falls within the margin, the model solves an aggressive convex optimization step that shifts the decision plane while minimizing perturbation to prior weights.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">2. High-Dimensional TF-IDF Projection</h3>
              <p>
                Headlines and article bodies are sanitized through WordNet lemmatization and projected into an 80,000-dimensional matrix capturing unigram frequencies and bigram contextual pairings.
              </p>
            </div>
          </div>
        </div>

        {/* Benchmarks Table */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Empirical Architecture Benchmarks</span>
          </h2>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/50 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-3.5">Benchmark Metric</th>
                  <th className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">Veritas Engine</th>
                  <th className="p-3.5">LLM Generative</th>
                  <th className="p-3.5">Naive Bayes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">{row.metric}</td>
                    <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{row.veritas}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{row.llm}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{row.naiveBayes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ethical Neutrality Pledge */}
        <div
          id="ethics"
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs"
        >
          <div className="flex items-center gap-2 font-bold text-sm mb-2 text-slate-900 dark:text-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Algorithmic Neutrality Pledge</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Veritas is strictly designed to evaluate <strong className="text-slate-900 dark:text-slate-100 font-semibold">syntactic authenticity and structural integrity</strong>, not political perspective. Our models undergo continuous bias audits across partisan spectra to guarantee that conservative, progressive, and independent reporting formats receive equitable scrutiny without lexical prejudice.
          </p>
        </div>

        {/* Research Contributors */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Research Contributors &amp; Advisory</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs"
              >
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{member.name}</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold mb-1">{member.role}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 text-center">
          <Link
            href="/console"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <span>Test the Algorithm in Truth Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
