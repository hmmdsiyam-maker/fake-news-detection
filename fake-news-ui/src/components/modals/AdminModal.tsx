"use client";

import React, { useState } from "react";
import {
  Shield,
  X,
  RefreshCw,
  Search,
  Trash2,
  Users,
  FileText,
  BarChart3,
  BookOpen,
  Edit,
  Plus
} from "lucide-react";
import { AdminStats, AdminUserItem, AdminGlobalLog, BlogPost } from "@/types";
import { PaginationControl } from "@/components/PaginationControl";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: AdminStats | null;
  users: AdminUserItem[];
  logs: AdminGlobalLog[];
  blogs?: BlogPost[];
  loading: boolean;
  isDark?: boolean;
  onRefresh: () => void;
  onSearchUsers: (query: string, role?: string, tier?: string) => void;
  onSearchLogs: (query: string, verdict?: string) => void;
  onDeleteUser: (userId: number) => void;
  onSaveBlog?: (data: Partial<BlogPost>, blogId?: number) => Promise<void>;
  onDeleteBlog?: (blogId: number) => Promise<void>;
  onRefreshBlogs?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  stats,
  users,
  logs,
  blogs = [],
  loading,
  onRefresh,
  onSearchUsers,
  onSearchLogs,
  onDeleteUser,
  onSaveBlog,
  onDeleteBlog,
  onRefreshBlogs
}) => {
  const [tab, setTab] = useState<"stats" | "users" | "logs" | "blogs">("stats");
  const [userQuery, setUserQuery] = useState("");
  const [userRoleFilter] = useState("all");
  const [userTierFilter] = useState("all");

  const [logQuery, setLogQuery] = useState("");
  const [logVerdictFilter] = useState("all");

  // Blog Editor State
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [blogForm, setBlogForm] = useState({
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
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogSearch, setBlogSearch] = useState("");

  if (!isOpen) return null;

  const handleOpenCreateBlog = () => {
    setEditingBlogId(null);
    setBlogForm({
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
    setBlogModalOpen(true);
  };

  const handleOpenEditBlog = (b: BlogPost) => {
    setEditingBlogId(b.id);
    setBlogForm({
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
    setBlogModalOpen(true);
  };

  const handleSaveBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveBlog) return;
    setBlogSaving(true);
    try {
      await onSaveBlog(blogForm, editingBlogId || undefined);
      setBlogModalOpen(false);
      if (onRefreshBlogs) onRefreshBlogs();
    } finally {
      setBlogSaving(false);
    }
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(blogSearch.toLowerCase())
  );

  // Pagination states
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(5);
  const paginatedUsers = users.slice((userPage - 1) * userPageSize, userPage * userPageSize);

  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(5);
  const paginatedLogs = logs.slice((logPage - 1) * logPageSize, logPage * logPageSize);

  const [blogPage, setBlogPage] = useState(1);
  const [blogPageSize, setBlogPageSize] = useState(5);
  const paginatedBlogs = filteredBlogs.slice((blogPage - 1) * blogPageSize, blogPage * blogPageSize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl relative text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Admin Telemetry &amp; Article Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              System analytics, registered accounts, audit logs, and published research
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pt-3 pb-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setTab("stats")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                tab === "stats"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("users")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                tab === "users"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users ({users.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("logs")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                tab === "logs"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Logs ({logs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("blogs");
                if (onRefreshBlogs) onRefreshBlogs();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                tab === "blogs"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Articles ({blogs.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {tab === "stats" && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Users</div>
                <div className="text-2xl font-bold font-mono mt-1 text-slate-900 dark:text-slate-100">
                  {stats.total_users}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Inferences</div>
                <div className="text-2xl font-bold font-mono mt-1 text-slate-900 dark:text-slate-100">
                  {stats.total_predictions}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">Average Latency</div>
                <div className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                  {stats.avg_latency} ms
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">Real Claims</div>
                <div className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                  {stats.real_predictions}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">Fake Claims</div>
                <div className="text-2xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">
                  {stats.fake_predictions}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">Average Confidence</div>
                <div className="text-2xl font-bold font-mono mt-1 text-indigo-600 dark:text-indigo-400">
                  {stats.avg_confidence}%
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {tab === "users" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={userQuery}
                  onChange={(e) => {
                    setUserQuery(e.target.value);
                    setUserPage(1);
                    onSearchUsers(e.target.value, userRoleFilter, userTierFilter);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Analyses</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 text-xs">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">{u.username}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                              u.role === "admin"
                                ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                              u.subscription_tier !== "free"
                                ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                : "text-slate-500 dark:text-slate-400"
                            }`}>
                              {u.subscription_tier || "free"}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                            {u.prediction_count}
                          </td>
                          <td className="p-3 text-right">
                            {u.role !== "admin" && (
                              <button
                                type="button"
                                onClick={() => onDeleteUser(u.id)}
                                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
                  onPageSizeChange={(sz) => {
                    setUserPageSize(sz);
                    setUserPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                />
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {tab === "logs" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter audit logs by headline or user..."
                  value={logQuery}
                  onChange={(e) => {
                    setLogQuery(e.target.value);
                    setLogPage(1);
                    onSearchLogs(e.target.value, logVerdictFilter);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-3">Headline</th>
                      <th className="p-3">Verdict</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                          No logs found.
                        </td>
                      </tr>
                    ) : (
                      paginatedLogs.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 max-w-xs truncate font-medium text-slate-900 dark:text-slate-100">
                            {l.headline}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              l.prediction === "Real News" || l.prediction === "REAL"
                                ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                : "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700"
                            }`}>
                              {l.prediction}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                            {l.confidence}%
                          </td>
                          <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400">
                            {l.username || "Guest"}
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
                  onPageSizeChange={(sz) => {
                    setLogPageSize(sz);
                    setLogPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                />
              </div>
            </div>
          )}

          {/* TAB 4: BLOG ARTICLES */}
          {tab === "blogs" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search articles by title or category..."
                    value={blogSearch}
                    onChange={(e) => {
                      setBlogSearch(e.target.value);
                      setBlogPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateBlog}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write Article</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-3">Title &amp; Slug</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Author</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                          No research articles found. Click &quot;Write Article&quot; to publish one.
                        </td>
                      </tr>
                    ) : (
                      paginatedBlogs.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 max-w-sm">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{b.title}</div>
                            <div className="text-[10px] text-slate-500 font-mono">/{b.slug}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                              {b.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">{b.author_name}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">{b.date}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditBlog(b)}
                                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 cursor-pointer"
                                title="Edit Post"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {onDeleteBlog && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteBlog(b.id)}
                                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
                                  title="Delete Post"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <PaginationControl
                  currentPage={blogPage}
                  totalItems={filteredBlogs.length}
                  pageSize={blogPageSize}
                  onPageChange={setBlogPage}
                  onPageSizeChange={(sz) => {
                    setBlogPageSize(sz);
                    setBlogPage(1);
                  }}
                  pageSizeOptions={[3, 5, 10]}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Write / Edit Article Modal */}
      {blogModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {editingBlogId ? "Edit Research Article" : "Write New Research Article"}
              </h3>
              <button
                type="button"
                onClick={() => setBlogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlogSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Article Title</label>
                <input
                  type="text"
                  required
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  placeholder="e.g. Reverse-Engineering Clickbait: How PassiveAggressive NLP Dissects Headlines"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">URL Slug</label>
                  <input
                    type="text"
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                    placeholder="auto-generated-if-empty"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Category</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  placeholder="A concise summary of the research..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Full Article Content (Markdown)</label>
                <textarea
                  required
                  rows={8}
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  placeholder="## Heading&#10;&#10;Write the markdown article body here..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Author Name</label>
                  <input
                    type="text"
                    value={blogForm.author_name}
                    onChange={(e) => setBlogForm({ ...blogForm, author_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Read Time</label>
                  <input
                    type="text"
                    value={blogForm.read_time}
                    onChange={(e) => setBlogForm({ ...blogForm, read_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBlogModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={blogSaving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
                >
                  {blogSaving ? "Saving..." : editingBlogId ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
