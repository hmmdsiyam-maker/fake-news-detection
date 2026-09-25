"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from "recharts";
import { useAdmin } from "@/context/AdminContext";

export default function AdminOverviewPage() {
  const { stats, payments, loading } = useAdmin();

  if (!stats) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        {loading ? "Loading metrics..." : "No metrics data available."}
      </div>
    );
  }

  const completedRevenue = payments
    .filter((p) => p.status?.toLowerCase() === "completed")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const displayRevenue = stats.total_revenue !== undefined ? stats.total_revenue : completedRevenue;
  const totalInferences = stats.total_predictions || 0;
  const realCount = stats.real_predictions || 0;
  const fakeCount = stats.fake_predictions || 0;

  const realPct = totalInferences > 0 ? ((realCount / totalInferences) * 100).toFixed(1) : "0";
  const fakePct = totalInferences > 0 ? ((fakeCount / totalInferences) * 100).toFixed(1) : "0";

  const pieData = [
    { name: "Real News", value: realCount, color: "#10b981" },
    { name: "Fake News", value: fakeCount, color: "#f43f5e" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Overview &amp; Intelligence Metrics</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time model inference analytics, platform revenue, and subscriber statistics.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Registered Users</div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {stats.total_users}
          </div>
          <p className="text-[11px] text-slate-400">Database user accounts</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total News Verifications</div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {stats.total_predictions}
          </div>
          <p className="text-[11px] text-slate-400">Lifetime model inferences</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Processing Speed</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {stats.avg_latency} ms
          </div>
          <p className="text-[11px] text-slate-400">TF-IDF vectorizer + model</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Verified Authentic News</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {stats.real_predictions}
          </div>
          <p className="text-[11px] text-slate-400">Genuine articles identified</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Fabricated / Fake News</div>
          <div className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
            {stats.fake_predictions}
          </div>
          <p className="text-[11px] text-slate-400">Misinformation flagged</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Confidence Score</div>
          <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
            {stats.avg_confidence}%
          </div>
          <p className="text-[11px] text-slate-400">Model certainty level</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Revenue Collected</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            ${Number(displayRevenue).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.total_payments !== undefined ? stats.total_payments : payments.length} transactions processed
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated MRR</div>
          <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
            ${stats.estimated_mrr?.toFixed(2) || "0.00"}
          </div>
          <p className="text-[11px] text-slate-400">Monthly recurring revenue</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Pro Subscribers</div>
          <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
            {stats.pro_users || 0}
          </div>
          <p className="text-[11px] text-slate-400">Active Pro accounts</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Enterprise Subscribers</div>
          <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
            {stats.enterprise_users || 0}
          </div>
          <p className="text-[11px] text-slate-400">Active Enterprise accounts</p>
        </div>
      </div>

      {/* Verification Ratio & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-800 dark:text-slate-200">Real vs. Fake Verification Ratio</span>
            <span className="text-slate-500 font-mono">
              {totalInferences} Total Inferences
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${totalInferences > 0 ? (realCount / totalInferences) * 100 : 50}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Authentic: ${realCount}`}
            />
            <div
              style={{ width: `${totalInferences > 0 ? (fakeCount / totalInferences) * 100 : 50}%` }}
              className="bg-rose-500 h-full transition-all duration-500"
              title={`Fabricated: ${fakeCount}`}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Authentic: {realCount} ({realPct}%)
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              Fake: {fakeCount} ({fakePct}%)
            </span>
          </div>
        </div>

        {/* Recharts Pie Chart */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center">
            Prediction Distribution
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px"
                  }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
