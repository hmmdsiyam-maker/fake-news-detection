import {
  UserProfile,
  PredictionResult,
  HistoryItem,
  AdminStats,
  AdminUserItem,
  AdminGlobalLog,
  SubscriptionPlan
} from "@/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Scalable HTTP Client Helper
 */
async function fetchClient<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.detail || `HTTP Error ${res.status}: ${res.statusText}`;
    const error = new Error(errorMsg) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  return data as T;
}

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        return data.status === "healthy";
      }
      return false;
    } catch {
      return false;
    }
  },

  // Auth
  login: async (identifier: string, password: string) => {
    return fetchClient<{ token: string; user: UserProfile }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username_or_email: identifier, password })
    });
  },

  register: async (username: string, email: string, password: string) => {
    return fetchClient<{ token: string; user: UserProfile }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
    });
  },

  getProfile: async (token: string) => {
    return fetchClient<UserProfile>("/api/v1/auth/me", {}, token);
  },

  // Prediction Inference
  predict: async (title: string, text: string, token?: string | null) => {
    return fetchClient<PredictionResult>(
      "/api/v1/predict",
      {
        method: "POST",
        body: JSON.stringify({ title, text })
      },
      token
    );
  },

  // Search History
  getHistory: async (
    token: string,
    params: { q?: string; verdict?: string; limit?: number; offset?: number } = {}
  ) => {
    const query = new URLSearchParams();
    if (params.q) query.append("q", params.q);
    if (params.verdict && params.verdict !== "all") query.append("verdict", params.verdict);
    query.append("limit", String(params.limit || 50));
    query.append("offset", String(params.offset || 0));

    return fetchClient<{ history: HistoryItem[]; count: number }>(
      `/api/v1/history?${query.toString()}`,
      {},
      token
    );
  },

  deleteHistoryItem: async (id: number, token: string) => {
    return fetchClient<{ status: string; id: number }>(
      `/api/v1/history/${id}`,
      { method: "DELETE" },
      token
    );
  },

  clearHistory: async (token: string) => {
    return fetchClient<{ status: string }>("/api/v1/history", { method: "DELETE" }, token);
  },

  // Admin Suite
  getAdminStats: async (token: string) => {
    return fetchClient<AdminStats>("/api/v1/admin/stats", {}, token);
  },

  getAdminUsers: async (
    token: string,
    params: { q?: string; role?: string; tier?: string } = {}
  ) => {
    const query = new URLSearchParams();
    if (params.q) query.append("q", params.q);
    if (params.role && params.role !== "all") query.append("role", params.role);
    if (params.tier && params.tier !== "all") query.append("tier", params.tier);

    return fetchClient<{ users: AdminUserItem[]; count: number }>(
      `/api/v1/admin/users?${query.toString()}`,
      {},
      token
    );
  },

  getAdminGlobalLogs: async (
    token: string,
    params: { q?: string; verdict?: string; limit?: number; offset?: number } = {}
  ) => {
    const query = new URLSearchParams();
    if (params.q) query.append("q", params.q);
    if (params.verdict && params.verdict !== "all") query.append("verdict", params.verdict);
    query.append("limit", String(params.limit || 100));
    query.append("offset", String(params.offset || 0));

    return fetchClient<{ logs: AdminGlobalLog[]; count: number }>(
      `/api/v1/admin/history?${query.toString()}`,
      {},
      token
    );
  },

  deleteUser: async (userId: number, token: string) => {
    return fetchClient<{ status: string; user_id: number }>(
      `/api/v1/admin/users/${userId}`,
      { method: "DELETE" },
      token
    );
  },

  // Subscription
  getPlans: async () => {
    return fetchClient<{ plans: SubscriptionPlan[] }>("/api/v1/subscription/plans");
  },

  createCheckoutSession: async (planId: string, token: string, successUrl?: string) => {
    return fetchClient<{
      checkout_url: string;
      session_id: string;
      mode: string;
      plan: SubscriptionPlan;
    }>(
      "/api/v1/subscription/create-checkout-session",
      {
        method: "POST",
        body: JSON.stringify({
          plan_id: planId,
          success_url: successUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
        })
      },
      token
    );
  },

  verifySession: async (sessionId: string, planId: string, token: string) => {
    return fetchClient<{
      status: string;
      message: string;
      subscription_tier: string;
      token: string;
      user: UserProfile;
    }>(
      "/api/v1/subscription/verify-session",
      {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, plan_id: planId })
      },
      token
    );
  },

  cancelSubscription: async (token: string) => {
    return fetchClient<{
      status: string;
      subscription_tier: string;
      token: string;
      message: string;
    }>("/api/v1/subscription/cancel", { method: "POST" }, token);
  },

  // Blog Engine
  getBlogs: async (params: { q?: string; category?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.append("q", params.q);
    if (params.category && params.category !== "All") query.append("category", params.category);
    return fetchClient<{ posts: import("@/types").BlogPost[]; count: number }>(
      `/api/v1/blogs?${query.toString()}`
    );
  },

  getBlogBySlug: async (slug: string) => {
    return fetchClient<import("@/types").BlogPost>(`/api/v1/blogs/${slug}`);
  },

  createBlog: async (data: Partial<import("@/types").BlogPost>, token: string) => {
    return fetchClient<{ status: string; post: import("@/types").BlogPost }>(
      "/api/v1/blogs",
      {
        method: "POST",
        body: JSON.stringify(data)
      },
      token
    );
  },

  updateBlog: async (blogId: number, data: Partial<import("@/types").BlogPost>, token: string) => {
    return fetchClient<{ status: string; post: import("@/types").BlogPost }>(
      `/api/v1/blogs/${blogId}`,
      {
        method: "PUT",
        body: JSON.stringify(data)
      },
      token
    );
  },

  deleteBlog: async (blogId: number, token: string) => {
    return fetchClient<{ status: string; id: number }>(
      `/api/v1/blogs/${blogId}`,
      { method: "DELETE" },
      token
    );
  }
};
