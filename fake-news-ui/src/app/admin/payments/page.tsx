"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  RotateCcw,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { PaginationControl } from "@/components/PaginationControl";

export default function AdminPaymentsPage() {
  const { stats, payments, exportToCSV } = useAdmin();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredPayments = payments.filter((p) => {
    const matchesQuery =
      !query ||
      (p.username && p.username.toLowerCase().includes(query.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(query.toLowerCase())) ||
      (p.stripe_session_id && p.stripe_session_id.toLowerCase().includes(query.toLowerCase())) ||
      `#pay-${p.id}`.includes(query.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || p.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPlan =
      planFilter === "all" || p.plan_id?.toLowerCase() === planFilter.toLowerCase();

    return matchesQuery && matchesStatus && matchesPlan;
  });

  const paginatedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

  const completedCount = payments.filter((p) => p.status?.toLowerCase() === "completed").length;
  const pendingCount = payments.filter((p) => p.status?.toLowerCase() === "pending").length;
  const refundedCount = payments.filter((p) => p.status?.toLowerCase() === "refunded").length;
  const totalRevenueDollars = payments
    .filter((p) => p.status?.toLowerCase() === "completed")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Title & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Payments &amp; Revenue Transactions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review customer checkout sessions, active tier invoices, payment methods, and revenue flow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportToCSV(filteredPayments, "veritas_payments.csv")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          title="Export payments table to CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Financial Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            ${Number(stats?.total_revenue !== undefined ? stats.total_revenue : totalRevenueDollars).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">All-time collected revenue</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Transactions</span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {stats?.total_payments !== undefined ? stats.total_payments : payments.length}
          </div>
          <p className="text-[11px] text-slate-400">Total processed checkouts</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {completedCount}
          </div>
          <p className="text-[11px] text-slate-400">
            {payments.length > 0 ? `${Math.round((completedCount / payments.length) * 100)}% success rate` : "0%"}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Pending / Refunded</span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
            {pendingCount + refundedCount}
          </div>
          <p className="text-[11px] text-slate-400">
            {pendingCount} pending, {refundedCount} refunded
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, email, or Stripe ID..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">All Plans</option>
            <option value="pro">Pro ($19/mo or $95.88/yr)</option>
            <option value="enterprise">Enterprise ($99/mo or $479.88/yr)</option>
          </select>

          {(query || statusFilter !== "all" || planFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setPlanFilter("all");
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

      {/* Payments Data Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3.5 sm:p-4">Reference</th>
                <th className="p-3.5 sm:p-4">Customer</th>
                <th className="p-3.5 sm:p-4">Plan Tier</th>
                <th className="p-3.5 sm:p-4">Amount</th>
                <th className="p-3.5 sm:p-4">Payment Method</th>
                <th className="p-3.5 sm:p-4">Status</th>
                <th className="p-3.5 sm:p-4 text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                    <CreditCard className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No payment records found matching the specified filters.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => {
                  const isCompleted = p.status?.toLowerCase() === "completed";
                  const isPending = p.status?.toLowerCase() === "pending";
                  const isRefunded = p.status?.toLowerCase() === "refunded";
                  const isPro = p.plan_id?.toLowerCase() === "pro";
                  const isEnterprise = p.plan_id?.toLowerCase() === "enterprise";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 sm:p-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          #PAY-{String(p.id).padStart(4, "0")}
                        </div>
                        {p.stripe_session_id && (
                          <div
                            className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] mt-0.5"
                            title={p.stripe_session_id}
                          >
                            {p.stripe_session_id}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                            {(p.username || "U")[0]}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {p.username || `User #${p.user_id}`}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                              {p.email || "No email linked"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isEnterprise
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : isPro
                              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {p.plan_id}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                          ${Number(p.amount || 0).toFixed(2)}
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono font-medium">{p.currency}</span>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 capitalize">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.payment_method || "Stripe"}</span>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isCompleted
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                              : isPending
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                              : isRefunded
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isRefunded && <RotateCcw className="w-3 h-3" />}
                          <span>{p.status}</span>
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                          {new Date(p.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
          totalItems={filteredPayments.length}
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
