"use client";

import React, { useState } from "react";
import { Search, Download, RotateCcw, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { PaginationControl } from "@/components/PaginationControl";

export default function AdminLogsPage() {
  const { logs, exportToCSV } = useAdmin();

  const [query, setQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredLogs = logs.filter((l) => {
    const matchesQuery =
      !query ||
      l.headline.toLowerCase().includes(query.toLowerCase()) ||
      (l.username && l.username.toLowerCase().includes(query.toLowerCase()));
    const matchesVerdict =
      verdictFilter === "all" ||
      (verdictFilter === "real" && (l.prediction === "Real News" || l.prediction === "REAL")) ||
      (verdictFilter === "fake" && (l.prediction === "Fake News" || l.prediction === "FAKE"));

    return matchesQuery && matchesVerdict;
  });

  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Title & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Verification Inferences &amp; Audit Logs</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit history of news headlines processed by the machine learning engine across all users.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportToCSV(filteredLogs, "veritas_verification_logs.csv")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          title="Export logs to CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search headline text or username..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={verdictFilter}
            onChange={(e) => {
              setVerdictFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">All Predictions</option>
            <option value="real">Authentic (Real)</option>
            <option value="fake">Fabricated (Fake)</option>
          </select>

          {(query || verdictFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setVerdictFilter("all");
                setPage(1);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs transition-colors cursor-pointer"
              title="Reset filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3.5 sm:p-4">Log ID</th>
                <th className="p-3.5 sm:p-4">User</th>
                <th className="p-3.5 sm:p-4 max-w-sm">Headline Claim</th>
                <th className="p-3.5 sm:p-4">Prediction</th>
                <th className="p-3.5 sm:p-4">Confidence</th>
                <th className="p-3.5 sm:p-4">Latency</th>
                <th className="p-3.5 sm:p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No verification records found matching your query.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((l) => {
                  const isReal = l.prediction === "Real News" || l.prediction === "REAL";

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 sm:p-4 font-mono text-slate-400 text-[11px]">
                        #{l.id}
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {l.username ? `@${l.username}` : "Guest"}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4 max-w-xs sm:max-w-md">
                        <p className="line-clamp-2 text-slate-700 dark:text-slate-300 font-sans" title={l.headline}>
                          {l.headline}
                        </p>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isReal
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          {isReal ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          <span>{isReal ? "Authentic" : "Fabricated"}</span>
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {l.confidence}%
                      </td>
                      <td className="p-3.5 sm:p-4 font-mono text-[11px] text-slate-400">
                        {l.latency_ms} ms
                      </td>
                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                          {new Date(l.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(l.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <PaginationControl
          currentPage={page}
          totalItems={filteredLogs.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
