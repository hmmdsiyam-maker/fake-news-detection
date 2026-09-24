"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Server,
  FileCode
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { API_BASE } from "@/lib/api";

export default function DocsPage() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "js">("curl");
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    curl: `curl -X POST "${API_BASE}/api/v1/predict" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "title": "US Senate passes bipartisan funding bill",
    "text": "The United States Senate overwhelmingly approved a funding package..."
  }'`,
    python: `import requests

url = "${API_BASE}/api/v1/predict"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_JWT_TOKEN"
}
payload = {
    "title": "US Senate passes bipartisan funding bill",
    "text": "The United States Senate overwhelmingly approved a funding package..."
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    js: `const response = await fetch("${API_BASE}/api/v1/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_JWT_TOKEN"
  },
  body: JSON.stringify({
    title: "US Senate passes bipartisan funding bill",
    text: "The United States Senate overwhelmingly approved a funding package..."
  })
});

const data = await response.json();
console.log(data);`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    showToast("Code snippet copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full min-w-0 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase font-mono text-indigo-600 dark:text-indigo-400">
            Developer Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Programmatic Truth Telemetry API
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            Integrate live fact-checking directly inside editorial publishing pipelines, social feeds, and newsroom bots.
          </p>
        </div>

        {/* Code Snippet Card */}
        <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs transition-colors w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">POST</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold break-all">/api/v1/predict</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex flex-1 sm:flex-initial rounded-xl bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
                {(["curl", "python", "js"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                      activeTab === lang
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {lang === "js" ? "TypeScript" : lang === "curl" ? "cURL" : "Python"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={copyCode}
                className="p-2 sm:p-1.5 shrink-0 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer shadow-2xs flex items-center justify-center"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-[10px] sm:text-xs font-mono text-slate-200 overflow-x-auto w-full leading-relaxed custom-scrollbar">
            <code>{codeSnippets[activeTab]}</code>
          </pre>
        </div>

        {/* JSON Response Sample */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-slate-400" />
            <span>Response Schema</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-[10px] sm:text-xs font-mono text-emerald-400 overflow-x-auto w-full leading-relaxed custom-scrollbar">
            <pre>
{`{
  "prediction": "REAL",
  "label": 1,
  "confidence": 98.42,
  "latency_ms": 34,
  "saved_to_history": true,
  "guest_remaining": null,
  "daily_remaining": 19,
  "subscription_tier": "free",
  "status": "success"
}`}
            </pre>
          </div>
        </div>

        {/* Endpoints Directory */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-400" />
            <span>Available Endpoints</span>
          </h2>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-mono min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Path</th>
                  <th className="p-3.5 font-sans">Description</th>
                  <th className="p-3.5 font-sans">Authentication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">POST</td>
                  <td className="p-3.5 text-slate-900 dark:text-slate-100 font-semibold">/api/v1/predict</td>
                  <td className="p-3.5 font-sans text-slate-600 dark:text-slate-400">Run real-time inference on headline &amp; text</td>
                  <td className="p-3.5 font-sans text-slate-700 dark:text-slate-300">Optional (Guest 5 max)</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">GET</td>
                  <td className="p-3.5 text-slate-900 dark:text-slate-100 font-semibold">/api/v1/blogs</td>
                  <td className="p-3.5 font-sans text-slate-600 dark:text-slate-400">Search and list published research articles</td>
                  <td className="p-3.5 font-sans text-slate-500 dark:text-slate-400">Public</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">GET</td>
                  <td className="p-3.5 text-slate-900 dark:text-slate-100 font-semibold">/api/v1/blogs/{`{slug}`}</td>
                  <td className="p-3.5 font-sans text-slate-600 dark:text-slate-400">Retrieve a single article by slug</td>
                  <td className="p-3.5 font-sans text-slate-500 dark:text-slate-400">Public</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">GET</td>
                  <td className="p-3.5 text-slate-900 dark:text-slate-100 font-semibold">/api/v1/history</td>
                  <td className="p-3.5 font-sans text-slate-600 dark:text-slate-400">Personal prediction history with SQL filters</td>
                  <td className="p-3.5 font-sans text-emerald-600 dark:text-emerald-400 font-semibold">Bearer Token</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">GET</td>
                  <td className="p-3.5 text-slate-900 dark:text-slate-100 font-semibold">/api/v1/admin/stats</td>
                  <td className="p-3.5 font-sans text-slate-600 dark:text-slate-400">System overview telemetry aggregated via Raw SQL</td>
                  <td className="p-3.5 font-sans text-amber-600 dark:text-amber-400 font-semibold">Admin Role</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
