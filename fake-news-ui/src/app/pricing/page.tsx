"use client";

import React, { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { api } from "@/lib/api";

export default function PricingPage() {
  const { currentUser, token, setAuthModalOpen, showToast } = useApp();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: "Community",
      badge: "Free",
      priceMonthly: "$0",
      priceAnnual: "$0",
      period: "forever",
      desc: "For individual readers and occasional claim verification.",
      features: [
        "100 daily verifications",
        "5 guest evaluations without login",
        "PassiveAggressive ML model",
        "Personal audit history (last 50)",
        "Standard inference latency"
      ],
      cta: "Current Plan",
      popular: false
    },
    {
      id: "pro",
      name: "Investigative Pro",
      badge: "Popular",
      priceMonthly: "$9.99",
      priceAnnual: "$7.99",
      period: "per month",
      desc: "For journalists, OSINT researchers, and intelligence analysts.",
      features: [
        "Unlimited daily verifications",
        "Sub-35ms priority inference",
        "Permanent Raw SQL audit registry",
        "Personal REST API Key access",
        "Export audit logs as CSV and JSON",
        "Priority direct support"
      ],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      id: "enterprise",
      name: "Newsroom Enterprise",
      badge: "Enterprise",
      priceMonthly: "$49.99",
      priceAnnual: "$39.99",
      period: "per month",
      desc: "For digital media houses, wire desks, and brand integrity teams.",
      features: [
        "Unlimited multi-seat team access",
        "High-throughput API (100 req/sec)",
        "Automated CMS & webhook feeds",
        "Admin telemetry dashboard",
        "Custom domain whitelisting",
        "99.98% uptime SLA"
      ],
      cta: "Deploy Enterprise",
      popular: false
    }
  ];

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") {
      showToast("You are already on the Free Community tier.", "info");
      return;
    }
    
    if (!token || !currentUser) {
      setAuthModalOpen(true);
      showToast("Please sign in or register to select a subscription plan.", "info");
      return;
    }

    setLoadingPlan(planId);
    try {
      showToast(`Redirecting to Secure Checkout...`, "info");
      const res = await api.createCheckoutSession(planId, token);
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Subscription checkout error";
      showToast(msg, "error");
    } finally {
      setLoadingPlan(null);
    }
  };

  const featureMatrix = [
    { feature: "Daily Verification Quota", free: "100 / day", pro: "Unlimited", ent: "Unlimited" },
    { feature: "Inference Latency", free: "< 60 ms", pro: "< 35 ms", ent: "< 25 ms (Dedicated)" },
    { feature: "REST API Access", free: "No", pro: "Yes (Personal)", ent: "Yes (Multi-Seat)" },
    { feature: "Raw SQL Audit History", free: "50 records", pro: "Unlimited", ent: "Unlimited + Export" },
    { feature: "Webhooks & Ingest", free: "No", pro: "No", ent: "Yes" },
    { feature: "Admin Telemetry Console", free: "No", pro: "No", ent: "Yes" },
    { feature: "Payment Gateway", free: "N/A", pro: "Stripe", ent: "Stripe / Invoicing" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Header */}
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold uppercase font-mono text-indigo-600 dark:text-indigo-400">
            Subscriptions &amp; Plans
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Predictable pricing for newsrooms and analysts.
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Verify breaking claims individually or scale across your entire editorial team with dedicated API keys.
          </p>

          {/* Billing Switch */}
          <div className="pt-3 flex items-center justify-center">
            <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100 font-semibold"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100 font-semibold"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => {
            const price = billingCycle === "monthly" ? p.priceMonthly : p.priceAnnual;
            const isCurrent = currentUser?.subscription_tier === p.id;

            return (
              <div
                key={p.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-colors shadow-2xs ${
                  isCurrent
                    ? "border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/10 relative"
                    : p.popular
                    ? "border-2 border-indigo-500 bg-white dark:bg-slate-900 shadow-md shadow-indigo-500/10 relative"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-semibold tracking-wider uppercase shadow-xs flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active Plan
                  </div>
                )}
                {p.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-semibold tracking-wider uppercase shadow-xs">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{p.name}</h3>
                    {p.popular && (
                      <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>

                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">{price}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/{p.period}</span>
                  </div>

                  <ul className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(p.id)}
                    disabled={isCurrent || loadingPlan !== null}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 cursor-default border border-emerald-200 dark:border-emerald-800/50"
                        : p.popular
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30"
                        : "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span>{loadingPlan === p.id ? "Processing..." : isCurrent ? "Current Plan" : p.cta}</span>
                    {!isCurrent && loadingPlan !== p.id && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tier Comparison Matrix</h2>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/50 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-3.5">Specification</th>
                  <th className="p-3.5">Community</th>
                  <th className="p-3.5 font-semibold text-indigo-600 dark:text-indigo-400">Pro ($9.99/mo)</th>
                  <th className="p-3.5">Enterprise ($49.99/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {featureMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">{row.feature}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{row.free}</td>
                    <td className="p-3.5 font-semibold text-indigo-600 dark:text-indigo-400 font-mono">{row.pro}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-mono">{row.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
