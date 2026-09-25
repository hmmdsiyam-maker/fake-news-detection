"use client";

import React, { useState } from "react";
import { Search, Trash2, Download, RotateCcw, Users } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { PaginationControl } from "@/components/PaginationControl";

export default function AdminUsersPage() {
  const { users, deleteUser, exportToCSV } = useAdmin();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      !query ||
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesTier =
      tierFilter === "all" ||
      (u.subscription_tier && u.subscription_tier.toLowerCase() === tierFilter.toLowerCase());

    return matchesQuery && matchesRole && matchesTier;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (userId: number, username: string) => {
    if (confirm(`Are you sure you want to delete user @${username}? All their prediction history will be wiped.`)) {
      deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">User Accounts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage registered Veritas accounts, subscriptions, quotas, and access levels.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportToCSV(filteredUsers, "veritas_users.csv")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          title="Export user list to CSV"
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
            placeholder="Search by username or email address..."
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
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>

          {(query || roleFilter !== "all" || tierFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setRoleFilter("all");
                setTierFilter("all");
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

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3.5 sm:p-4">User</th>
                <th className="p-3.5 sm:p-4">Role</th>
                <th className="p-3.5 sm:p-4">Subscription</th>
                <th className="p-3.5 sm:p-4">Inferences</th>
                <th className="p-3.5 sm:p-4">Joined Date</th>
                <th className="p-3.5 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 text-xs">
                    <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No user accounts found matching your query.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  const isPro = u.subscription_tier?.toLowerCase() === "pro";
                  const isEnterprise = u.subscription_tier?.toLowerCase() === "enterprise";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                            {u.username[0]}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              @{u.username}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            isAdmin
                              ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            isEnterprise
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : isPro
                              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {u.subscription_tier || "free"}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {u.prediction_count || 0}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4 text-slate-500 font-mono text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 sm:p-4 text-right">
                        {!isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id, u.username)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
          totalItems={filteredUsers.length}
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
