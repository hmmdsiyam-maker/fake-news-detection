"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  RefreshCw,
  Search,
  Trash2,
  Users,
  FileText,
  BarChart3,
  BookOpen,
  Edit,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Lock,
  X
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { AdminStats, AdminUserItem, AdminGlobalLog, BlogPost } from "@/types";
import { PaginationControl } from "@/components/PaginationControl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Utility for CSV Export
const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) => (typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val))
      .join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export default function AdminDashboardPage() {
  const { token, currentUser, setAuthModalOpen, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "logs" | "articles">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [logs, setLogs] = useState<AdminGlobalLog[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [userQuery, setUserQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userTierFilter, setUserTierFilter] = useState("all");
  const [logQuery, setLogQuery] = useState("");
  const [logVerdictFilter, setLogVerdictFilter] = useState("all");
  const [blogSearch, setBlogSearch] = useState("");

  // Article Modal Form State
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: "",
    slug: "",
    category: "AI Research",
    excerpt: "",
    content: "",
    author_name: "Veritas Research Team",
    author_role: "Lead Researcher",
    read_time: "5 min read",
    tags: "",
    featured: false
  });
  const [articleSaving, setArticleSaving] = useState(false);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    if (!token || currentUser?.role !== "admin") return;
    setLoading(true);

    try {
      const [statsData, usersData, logsData, blogsData] = await Promise.all([
        api.getAdminStats(token).catch(() => null),
        api.getAdminUsers(token, { q: userQuery, role: userRoleFilter, tier: userTierFilter }).catch(() => ({ users: [] })),
        api.getAdminGlobalLogs(token, { q: logQuery, verdict: logVerdictFilter }).catch(() => ({ logs: [] })),
        api.getBlogs().catch(() => ({ posts: [] }))
      ]);

      if (statsData) setStats(statsData);
      if (usersData?.users) setUsers(usersData.users);
      if (logsData?.logs) setLogs(logsData.logs);
      if (blogsData?.posts) setBlogs(blogsData.posts);
    } catch {
      showToast("Error loading admin dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, currentUser, userQuery, userRoleFilter, userTierFilter, logQuery, logVerdictFilter, showToast]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadDashboardData();
    }
  }, [currentUser, loadDashboardData]);

  // Handle User Deletion
  const handleDeleteUser = async (userId: number) => {
    if (!token || !confirm("Are you sure you want to delete this user? All their history will be removed.")) return;
    try {
      await api.deleteUser(userId, token);
      showToast("User deleted successfully.", "success");
      loadDashboardData();
    } catch {
      showToast("Failed to delete user.", "error");
    }
  };

  // Article Actions
  const handleOpenCreateArticle = () => {
    setEditingArticleId(null);
    setArticleForm({
      title: "",
      slug: "",
      category: "AI Research",
      excerpt: "",
      content: "",
      author_name: "Veritas Research Team",
      author_role: "Lead Researcher",
      read_time: "5 min read",
      tags: "",
      featured: false
    });
    setArticleModalOpen(true);
  };

  const handleOpenEditArticle = (b: BlogPost) => {
    setEditingArticleId(b.id);
    setArticleForm({
      title: b.title,
      slug: b.slug,
      category: b.category,
      excerpt: b.excerpt,
      content: b.content,
      author_name: b.author_name,
      author_role: b.author_role,
      read_time: b.read_time,
      tags: b.tags,
      featured: b.featured
    });
    setArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setArticleSaving(true);
    try {
      if (editingArticleId) {
        await api.updateBlog(editingArticleId, articleForm, token);
        showToast("Article updated successfully.", "success");
      } else {
        await api.createBlog(articleForm, token);
        showToast("Article published successfully.", "success");
      }
      setArticleModalOpen(false);
      loadDashboardData();
    } catch {
      showToast("Failed to save article.", "error");
    } finally {
      setArticleSaving(false);
    }
  };

  const handleDeleteArticle = async (blogId: number) => {
    if (!token || !confirm("Are you sure you want to delete this research article?")) return;
    try {
      await api.deleteBlog(blogId, token);
      showToast("Article deleted successfully.", "success");
      loadDashboardData();
    } catch {
      showToast("Failed to delete article.", "error");
    }
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(blogSearch.toLowerCase())
  );

  // Pagination States
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const paginatedUsers = users.slice((userPage - 1) * userPageSize, userPage * userPageSize);

  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(10);
  const paginatedLogs = logs.slice((logPage - 1) * logPageSize, logPage * logPageSize);

  const [articlePage, setArticlePage] = useState(1);
  const [articlePageSize, setArticlePageSize] = useState(8);
  const paginatedArticles = filteredBlogs.slice((articlePage - 1) * articlePageSize, articlePage * articlePageSize);

  // Authentication Guard View
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
        <div className="w-full max-w-md p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">Admin Privileges Required</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This dashboard is restricted to administrator accounts. Please sign in with administrator credentials.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            {!currentUser ? (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
              >
                Sign In to Admin
              </button>
            ) : null}
            <Link
              href="/"
              className="w-full py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-center"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 sm:px-8 h-16 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Site</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight">Admin Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">@{currentUser.username}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold">
              Admin
            </span>
          </div>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview &amp; Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "logs"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Verification Logs ({logs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("articles")}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "articles"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Research Articles ({blogs.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
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
            </div>

            {/* Verification Ratio Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">Real vs. Fake Verification Ratio</span>
                  <span className="text-slate-500 font-mono">
                    {stats.total_predictions} Total Inferences
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    style={{
                      width: `${stats.total_predictions > 0 ? (stats.real_predictions / stats.total_predictions) * 100 : 50}%`
                    }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Authentic: ${stats.real_predictions}`}
                  />
                  <div
                    style={{
                      width: `${stats.total_predictions > 0 ? (stats.fake_predictions / stats.total_predictions) * 100 : 50}%`
                    }}
                    className="bg-rose-500 h-full transition-all duration-500"
                    title={`Fabricated: ${stats.fake_predictions}`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Authentic: {stats.real_predictions} ({stats.total_predictions > 0 ? ((stats.real_predictions / stats.total_predictions) * 100).toFixed(1) : 0}%)
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    Fake: {stats.fake_predictions} ({stats.total_predictions > 0 ? ((stats.fake_predictions / stats.total_predictions) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>

              {/* Recharts Pie Chart */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center">Prediction Distribution</div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Real News", value: stats.real_predictions },
                          { name: "Fake News", value: stats.fake_predictions }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="#10b981" />
                        <Cell key="cell-1" fill="#f43f5e" />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user accounts by username or email..."
                  value={userQuery}
                  onChange={(e) => {
                    setUserQuery(e.target.value);
                    setUserPage(1);
                    api.getAdminUsers(token!, { q: e.target.value, role: userRoleFilter, tier: userTierFilter }).then((res) => {
                      if (res.users) setUsers(res.users);
                    });
                  }}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                    api.getAdminUsers(token!, { q: userQuery, role: e.target.value, tier: userTierFilter }).then((res) => {
                      if (res.users) setUsers(res.users);
                    });
                  }}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Standard Users</option>
                </select>

                <select
                  value={userTierFilter}
                  onChange={(e) => {
                    setUserTierFilter(e.target.value);
                    setUserPage(1);
                    api.getAdminUsers(token!, { q: userQuery, role: userRoleFilter, tier: e.target.value }).then((res) => {
                      if (res.users) setUsers(res.users);
                    });
                  }}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                <button
                  type="button"
                  onClick={() => exportToCSV(users, "veritas_users.csv")}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-semibold flex items-center gap-1.5"
                  title="Export to CSV"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Subscription Plan</th>
                    <th className="p-3.5">Total Checks</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No user accounts found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{u.username}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              u.role === "admin"
                                ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              u.subscription_tier !== "free"
                                ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {u.subscription_tier || "free"}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {u.prediction_count}
                        </td>
                        <td className="p-3.5 text-right">
                          {u.role !== "admin" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <PaginationControl
                currentPage={userPage}
                totalItems={users.length}
                pageSize={userPageSize}
                onPageChange={setUserPage}
                onPageSizeChange={(newSize) => {
                  setUserPageSize(newSize);
                  setUserPage(1);
                }}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter audit logs by headline or username..."
                  value={logQuery}
                  onChange={(e) => {
                    setLogQuery(e.target.value);
                    setLogPage(1);
                    api.getAdminGlobalLogs(token!, { q: e.target.value, verdict: logVerdictFilter }).then((res) => {
                      if (res.logs) setLogs(res.logs);
                    });
                  }}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={logVerdictFilter}
                  onChange={(e) => {
                    setLogVerdictFilter(e.target.value);
                    setLogPage(1);
                    api.getAdminGlobalLogs(token!, { q: logQuery, verdict: e.target.value }).then((res) => {
                      if (res.logs) setLogs(res.logs);
                    });
                  }}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Verdicts</option>
                  <option value="Real News">Real Only</option>
                  <option value="Fake News">Fake Only</option>
                </select>

                <button
                  type="button"
                  onClick={() => exportToCSV(logs, "veritas_logs.csv")}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-semibold flex items-center gap-1.5"
                  title="Export to CSV"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="p-3.5">Headline / Content</th>
                    <th className="p-3.5">Verdict</th>
                    <th className="p-3.5">Confidence</th>
                    <th className="p-3.5">Latency</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        No verification logs found matching query.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 max-w-sm">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {l.headline || "Untitled Search"}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              l.prediction === "Real News" || l.prediction === "REAL"
                                ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                : "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700"
                            }`}
                          >
                            {l.prediction}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {l.confidence}%
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">
                          {l.latency_ms} ms
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300">
                          {l.username || <span className="text-slate-400 italic">Guest</span>}
                        </td>
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(l.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <PaginationControl
                currentPage={logPage}
                totalItems={logs.length}
                pageSize={logPageSize}
                onPageChange={setLogPage}
                onPageSizeChange={(newSize) => {
                  setLogPageSize(newSize);
                  setLogPage(1);
                }}
                pageSizeOptions={[5, 10, 25, 50]}
              />
            </div>
          </div>
        )}

        {/* TAB 4: RESEARCH ARTICLES (CRUD) */}
        {activeTab === "articles" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles by title or category..."
                  value={blogSearch}
                  onChange={(e) => {
                    setBlogSearch(e.target.value);
                    setArticlePage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenCreateArticle}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Write New Article</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="p-3.5">Title &amp; URL Slug</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Author</th>
                    <th className="p-3.5">Read Time</th>
                    <th className="p-3.5">Published Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredBlogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No articles found. Click &quot;Write New Article&quot; to publish your first post.
                      </td>
                    </tr>
                  ) : (
                    paginatedArticles.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 max-w-sm">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{b.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">/{b.slug}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {b.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                          {b.author_name}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {b.read_time}
                        </td>
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">
                          {b.date}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditArticle(b)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              title="Edit Article"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(b.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              title="Delete Article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <PaginationControl
                currentPage={articlePage}
                totalItems={filteredBlogs.length}
                pageSize={articlePageSize}
                onPageChange={setArticlePage}
                onPageSizeChange={(newSize) => {
                  setArticlePageSize(newSize);
                  setArticlePage(1);
                }}
                pageSizeOptions={[4, 8, 16, 24]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Write / Edit Article Modal */}
      {articleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {editingArticleId ? "Edit Research Article" : "Write New Research Article"}
              </h3>
              <button
                type="button"
                onClick={() => setArticleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Article Title</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. Reverse-Engineering Clickbait: How Machine Learning Analyzes Headlines"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">URL Slug</label>
                  <input
                    type="text"
                    value={articleForm.slug}
                    onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })}
                    placeholder="auto-generated-if-empty"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Category</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="AI Research">AI Research</option>
                    <option value="OSINT">OSINT</option>
                    <option value="Methodology">Methodology</option>
                    <option value="Case Study">Case Study</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Short Excerpt / Summary</label>
                <textarea
                  required
                  rows={2}
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="A concise summary of the research..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Full Article Content (Markdown)</label>
                <textarea
                  required
                  rows={8}
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="## Heading&#10;&#10;Write the markdown article body here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Author Name</label>
                  <input
                    type="text"
                    value={articleForm.author_name}
                    onChange={(e) => setArticleForm({ ...articleForm, author_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Estimated Read Time</label>
                  <input
                    type="text"
                    value={articleForm.read_time}
                    onChange={(e) => setArticleForm({ ...articleForm, read_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setArticleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={articleSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {articleSaving ? "Saving..." : editingArticleId ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
