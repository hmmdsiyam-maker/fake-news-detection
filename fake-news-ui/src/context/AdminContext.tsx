"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { AdminStats, AdminUserItem, AdminGlobalLog, BlogPost, AdminPaymentItem } from "@/types";

interface AdminContextType {
  stats: AdminStats | null;
  users: AdminUserItem[];
  logs: AdminGlobalLog[];
  blogs: BlogPost[];
  payments: AdminPaymentItem[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  deleteUser: (userId: number) => Promise<boolean>;
  deleteArticle: (blogId: number) => Promise<boolean>;
  saveArticle: (articleForm: any, editingArticleId?: number | null) => Promise<boolean>;
  exportToCSV: (data: any[], filename: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
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

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, currentUser, showToast } = useApp();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [logs, setLogs] = useState<AdminGlobalLog[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshAll = useCallback(async () => {
    if (!token || currentUser?.role !== "admin") return;
    setLoading(true);

    try {
      const [statsData, usersData, logsData, blogsData, paymentsData] = await Promise.all([
        api.getAdminStats(token).catch(() => null),
        api.getAdminUsers(token, { q: "", role: "all", tier: "all" }).catch(() => ({ users: [] })),
        api.getAdminGlobalLogs(token, { q: "", verdict: "all" }).catch(() => ({ logs: [] })),
        api.getBlogs().catch(() => ({ posts: [] })),
        api.getAdminPayments(token, { q: "", status: "all", plan: "all" }).catch(() => ({ payments: [] }))
      ]);

      if (statsData) setStats(statsData);
      if (usersData?.users) setUsers(usersData.users);
      if (logsData?.logs) setLogs(logsData.logs);
      if (blogsData?.posts) setBlogs(blogsData.posts);
      if (paymentsData?.payments) setPayments(paymentsData.payments);
    } catch {
      showToast("Error loading admin dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, currentUser, showToast]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      refreshAll();
    }
  }, [currentUser, refreshAll]);

  const deleteUser = async (userId: number): Promise<boolean> => {
    if (!token) return false;
    try {
      await api.deleteUser(userId, token);
      showToast("User deleted successfully.", "success");
      await refreshAll();
      return true;
    } catch {
      showToast("Failed to delete user.", "error");
      return false;
    }
  };

  const deleteArticle = async (blogId: number): Promise<boolean> => {
    if (!token) return false;
    try {
      await api.deleteBlog(blogId, token);
      showToast("Article deleted successfully.", "success");
      await refreshAll();
      return true;
    } catch {
      showToast("Failed to delete article.", "error");
      return false;
    }
  };

  const saveArticle = async (articleForm: any, editingArticleId?: number | null): Promise<boolean> => {
    if (!token) return false;
    try {
      if (editingArticleId) {
        await api.updateBlog(editingArticleId, articleForm, token);
        showToast("Article updated successfully.", "success");
      } else {
        await api.createBlog(articleForm, token);
        showToast("Article published successfully.", "success");
      }
      await refreshAll();
      return true;
    } catch {
      showToast("Failed to save article.", "error");
      return false;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        stats,
        users,
        logs,
        blogs,
        payments,
        loading,
        refreshAll,
        deleteUser,
        deleteArticle,
        saveArticle,
        exportToCSV
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
