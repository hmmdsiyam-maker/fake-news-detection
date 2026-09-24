"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import {
  HistoryItem,
  AdminStats,
  AdminUserItem,
  AdminGlobalLog,
  SubscriptionPlan,
  BlogPost
} from "@/types";

import { AuthModal } from "@/components/modals/AuthModal";
import { HistoryModal } from "@/components/modals/HistoryModal";
import { AdminModal } from "@/components/modals/AdminModal";
import { PricingModal } from "@/components/modals/PricingModal";
import { QuotaExhaustedModal } from "@/components/modals/QuotaExhaustedModal";
import { NotificationToast } from "@/components/NotificationToast";

interface AppModalsProps {
  onLoadHistoryItem?: (item: HistoryItem) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({ onLoadHistoryItem }) => {
  const {
    isDark,
    token,
    currentUser,
    login,
    logout,
    refreshUser,
    authModalOpen,
    setAuthModalOpen,
    pricingModalOpen,
    setPricingModalOpen,
    historyModalOpen,
    setHistoryModalOpen,
    adminModalOpen,
    setAdminModalOpen,
    quotaModalOpen,
    setQuotaModalOpen,
    toast,
    hideToast,
    showToast
  } = useApp();

  // History State
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Admin Data State
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminGlobalLog[]>([]);
  const [adminBlogs, setAdminBlogs] = useState<BlogPost[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // Plans State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load plans on mount
  useEffect(() => {
    api.getPlans()
      .then((data) => {
        if (data?.plans) setPlans(data.plans);
      })
      .catch(() => {});
  }, []);

  // Fetch User History
  const fetchUserHistory = useCallback(
    async (searchQuery = "", verdictFilter = "") => {
      const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("truth-console-token") : null);
      if (!activeToken) return;

      setHistoryLoading(true);
      try {
        const res = await api.getHistory(activeToken, {
          q: searchQuery,
          verdict: verdictFilter,
          limit: 50,
          offset: 0
        });
        setUserHistory(res.history || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load history";
        showToast(msg, "error");
      } finally {
        setHistoryLoading(false);
      }
    },
    [token, showToast]
  );

  useEffect(() => {
    if (historyModalOpen && currentUser) {
      fetchUserHistory();
    }
  }, [historyModalOpen, currentUser, fetchUserHistory]);

  const handleDeleteHistoryItem = async (historyId: number) => {
    if (!token) return;
    try {
      await api.deleteHistoryItem(historyId, token);
      setUserHistory((prev) => prev.filter((item) => item.id !== historyId));
      showToast("History record deleted.", "info");
    } catch {
      showToast("Failed to delete record.", "error");
    }
  };

  const handleClearHistory = async () => {
    if (!token) return;
    try {
      await api.clearHistory(token);
      setUserHistory([]);
      showToast("All prediction history cleared.", "info");
    } catch {
      showToast("Failed to clear history.", "error");
    }
  };

  // Fetch Admin Data
  const fetchAdminBlogs = useCallback(async () => {
    try {
      const res = await api.getBlogs();
      setAdminBlogs(res.posts || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchAdminData = useCallback(
    async (userSearch = "", roleFilter = "all", tierFilter = "all", logSearch = "", verdictFilter = "all") => {
      const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("truth-console-token") : null);
      if (!activeToken) return;

      setAdminLoading(true);
      try {
        const [stats, usersRes, logsRes] = await Promise.all([
          api.getAdminStats(activeToken),
          api.getAdminUsers(activeToken, { q: userSearch, role: roleFilter, tier: tierFilter }),
          api.getAdminGlobalLogs(activeToken, { q: logSearch, verdict: verdictFilter, limit: 50, offset: 0 })
        ]);
        setAdminStats(stats);
        setAdminUsers(usersRes.users || []);
        setAdminLogs(logsRes.logs || []);
        fetchAdminBlogs();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to fetch admin telemetry";
        showToast(msg, "error");
      } finally {
        setAdminLoading(false);
      }
    },
    [token, showToast, fetchAdminBlogs]
  );

  useEffect(() => {
    if (adminModalOpen && currentUser?.role === "admin") {
      fetchAdminData();
    }
  }, [adminModalOpen, currentUser, fetchAdminData]);

  const handleDeleteUserByAdmin = async (userId: number) => {
    if (!token) return;
    try {
      await api.deleteUser(userId, token);
      setAdminUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast(`User ID #${userId} purged by administrator.`, "info");
    } catch {
      showToast("Failed to delete user.", "error");
    }
  };

  // Admin Blog CRUD
  const handleSaveBlog = async (data: Partial<BlogPost>, blogId?: number) => {
    if (!token) return;
    try {
      if (blogId) {
        await api.updateBlog(blogId, data, token);
        showToast("Article updated successfully.", "success");
      } else {
        await api.createBlog(data, token);
        showToast("New article published successfully.", "success");
      }
      fetchAdminBlogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save article";
      showToast(msg, "error");
    }
  };

  const handleDeleteBlog = async (blogId: number) => {
    if (!token) return;
    try {
      await api.deleteBlog(blogId, token);
      setAdminBlogs((prev) => prev.filter((b) => b.id !== blogId));
      showToast("Article deleted from database.", "info");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete article";
      showToast(msg, "error");
    }
  };

  // Auth Handlers
  const handleLogin = async (identifier: string, pass: string) => {
    const data = await api.login(identifier, pass);
    login(data.token, data.user);
    setAuthModalOpen(false);
  };

  const handleRegister = async (u: string, e: string, pass: string) => {
    const data = await api.register(u, e, pass);
    login(data.token, data.user);
    setAuthModalOpen(false);
  };

  // Stripe Checkout
  const handleUpgradePlan = async (planId: string) => {
    if (!token || !currentUser) {
      setPricingModalOpen(false);
      setAuthModalOpen(true);
      showToast("Please sign in or register to select a subscription plan.", "info");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await api.createCheckoutSession(planId, token);
      if (res.checkout_url) {
        showToast(`Redirecting to Stripe Checkout for ${planId}...`, "info");
        window.location.href = res.checkout_url;
      } else {
        showToast(`Successfully updated plan!`, "success");
        await refreshUser();
        setPricingModalOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Subscription checkout error";
      showToast(msg, "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!token) return;
    try {
      await api.cancelSubscription(token);
      showToast("Subscription cancelled. Reverted to Free Community plan.", "info");
      await refreshUser();
    } catch {
      showToast("Failed to cancel subscription.", "error");
    }
  };

  return (
    <>
      {/* Toast Notification */}
      <NotificationToast
        message={toast.show ? toast.message : null}
        onClose={hideToast}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        isDark={isDark}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        isDark={isDark}
        history={userHistory}
        currentUser={currentUser}
        loading={historyLoading}
        onRestore={(item) => {
          if (onLoadHistoryItem) onLoadHistoryItem(item);
          setHistoryModalOpen(false);
        }}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
        onSearch={(q: string, v: string) => fetchUserHistory(q, v)}
      />

      {/* Admin Telemetry Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        isDark={isDark}
        stats={adminStats}
        users={adminUsers}
        logs={adminLogs}
        blogs={adminBlogs}
        loading={adminLoading}
        onRefresh={() => fetchAdminData()}
        onSearchUsers={(q: string, r?: string, t?: string) => fetchAdminData(q, r || "all", t || "all")}
        onSearchLogs={(q: string, v?: string) => fetchAdminData("", "all", "all", q, v || "all")}
        onDeleteUser={handleDeleteUserByAdmin}
        onSaveBlog={handleSaveBlog}
        onDeleteBlog={handleDeleteBlog}
        onRefreshBlogs={fetchAdminBlogs}
      />

      {/* Pricing / Stripe Modal */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        isDark={isDark}
        plans={plans}
        currentUser={currentUser}
        checkoutLoading={checkoutLoading}
        onUpgradePlan={handleUpgradePlan}
        onCancelSubscription={handleCancelSubscription}
      />

      {/* Daily Quota Exhausted Modal */}
      <QuotaExhaustedModal
        isOpen={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        isDark={isDark}
        checkoutLoading={checkoutLoading}
        onUpgradePro={() => handleUpgradePlan("pro")}
        onOpenPricing={() => {
          setQuotaModalOpen(false);
          setPricingModalOpen(true);
        }}
      />
    </>
  );
};
