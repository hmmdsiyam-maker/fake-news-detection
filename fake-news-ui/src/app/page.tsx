"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Gauge,
  Activity,
  FileText,
  Sun,
  Moon,
  User,
  LogIn,
  LogOut,
  History,
  Trash2,
  Lock,
  Mail,
  Shield,
  Clock,
  X,
  Database,
  BarChart3,
  Search,
  ExternalLink,
  Key,
  CreditCard,
  Zap,
  CheckCircle2,
  Crown
} from "lucide-react";
import confetti from "canvas-confetti";

interface PredictionResult {
  prediction: "Fake News" | "Real News";
  label: number; // 0 = Real, 1 = Fake
  confidence: number;
  latency_ms?: number;
  saved_to_history?: boolean;
  guest_remaining?: number | null;
  daily_remaining?: number | null;
  subscription_tier?: string;
  status: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  subscription_tier?: string;
  today_count?: number;
  daily_limit?: number | string;
  today_remaining?: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  daily_limit: number | string;
  description: string;
  badge?: string;
  is_popular?: boolean;
  features: string[];
}

interface HistoryItem {
  id: number;
  headline: string;
  content_preview: string;
  prediction: string;
  label: number;
  confidence: number;
  latency_ms: number;
  created_at: string;
}

interface AdminStats {
  total_users: number;
  total_predictions: number;
  real_predictions: number;
  fake_predictions: number;
  avg_confidence: number;
  avg_latency: number;
  active_today: number;
}

interface AdminUserItem {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string | null;
  prediction_count: number;
}

interface AdminGlobalLog {
  id: number;
  headline: string;
  prediction: string;
  confidence: number;
  latency_ms: number;
  created_at: string;
  username: string | null;
  email: string | null;
}

const PRESETS = {
  real: {
    title: "US Senate passes bipartisan funding bill to prevent government shutdown",
    text: "WASHINGTON (Reuters) - The United States Senate overwhelmingly approved a bipartisan funding package on Thursday, sending the legislation to the president for signing into law. The measure funds key government agencies through the remainder of the fiscal year, avoiding a disruptive partial shutdown of federal operations across the country."
  },
  fake: {
    title: "SHOCKING SECRET: Alien DNA Found in Water Supplies Across the World!",
    text: "Undercover whistleblowers reveal that global elites have introduced secret alien bio-technology into city water networks to hypnotize the general population and control human thoughts via satellite frequency towers! Share before this gets taken down immediately by authorities!"
  }
};

const API_BASE = "http://127.0.0.1:8000";
const GUEST_USAGE_LIMIT = 5;

export default function FakeNewsDetectorPage() {
  const [theme, setTheme] = useState<"white" | "dark">("white");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Guest Usage Tracker (Max 5 for non-login users)
  const [guestCount, setGuestCount] = useState<number>(0);

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // User History State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCount, setHistoryCount] = useState<number>(0);

  // Admin Telemetry State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminGlobalLog[]>([]);
  const [adminTab, setAdminTab] = useState<"stats" | "users" | "logs">("stats");
  const [adminLoading, setAdminLoading] = useState(false);

  // Subscription & Stripe Monetization State
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccessNotice, setCheckoutSuccessNotice] = useState<string | null>(null);
  const [quotaExhaustedModalOpen, setQuotaExhaustedModalOpen] = useState(false);

  // Sync theme with body class and localStorage
  useEffect(() => {
    const saved = localStorage.getItem("truth-console-theme") as "white" | "dark" | null;
    if (saved === "dark" || saved === "white") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    document.body.classList.remove("theme-white", "theme-dark");
    document.body.classList.add(theme === "dark" ? "theme-dark" : "theme-white");
    localStorage.setItem("truth-console-theme", theme);
  }, [theme]);

  // Load Auth Token & Guest Count from localStorage on mount & check Stripe Checkout
  useEffect(() => {
    const savedGuest = localStorage.getItem("truth-console-guest-count");
    if (savedGuest) {
      setGuestCount(parseInt(savedGuest, 10) || 0);
    }

    // Load available plans from backend
    fetch(`${API_BASE}/api/v1/subscription/plans`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.plans) setPlans(data.plans);
      })
      .catch(() => {});

    const savedToken = localStorage.getItem("truth-console-token");
    const savedUser = localStorage.getItem("truth-console-user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
        // Verify with /me
        fetch(`${API_BASE}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` }
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Token invalid");
          })
          .then((userData) => {
            setCurrentUser(userData);
            localStorage.setItem("truth-console-user", JSON.stringify(userData));
          })
          .catch(() => {
            setToken(null);
            setCurrentUser(null);
            localStorage.removeItem("truth-console-token");
            localStorage.removeItem("truth-console-user");
          });
      } catch {
        // ignore parse error
      }
    }

    // Check for returned Stripe Checkout session redirect
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const checkoutSessionId = urlParams.get("session_id");
      const checkoutPlanId = urlParams.get("plan_id");
      const checkoutStatus = urlParams.get("checkout");

      if (checkoutStatus === "success" && checkoutSessionId && checkoutPlanId) {
        const activeToken = savedToken || localStorage.getItem("truth-console-token");
        if (activeToken) {
          fetch(`${API_BASE}/api/v1/subscription/verify-session`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${activeToken}`
            },
            body: JSON.stringify({
              session_id: checkoutSessionId,
              plan_id: checkoutPlanId
            })
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.status === "success") {
                if (data.token) {
                  setToken(data.token);
                  localStorage.setItem("truth-console-token", data.token);
                }
                if (data.user) {
                  setCurrentUser(data.user);
                  localStorage.setItem("truth-console-user", JSON.stringify(data.user));
                }
                setCheckoutSuccessNotice(`Account upgraded to ${checkoutPlanId.toUpperCase()}! You now have unlimited daily verifications.`);
                confetti({
                  particleCount: 100,
                  spread: 80,
                  origin: { y: 0.5 },
                  colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899"]
                });
              }
            })
            .catch((err) => console.error("Verify session error:", err))
            .finally(() => {
              window.history.replaceState({}, document.title, window.location.pathname);
            });
        }
      }
    }
  }, []);

  // Fetch user history count
  const fetchUserHistory = useCallback(async () => {
    if (!token) {
      setUserHistory([]);
      setHistoryCount(0);
      return;
    }
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/history?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserHistory(data.history || []);
        setHistoryCount(data.count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUserHistory();
    }
  }, [token, fetchUserHistory]);

  // Check Backend Health
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setApiOnline(data.status === "healthy");
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Handle Login / Registration
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username_or_email: authUsername,
            password: authPassword
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed");

        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("truth-console-token", data.token);
        localStorage.setItem("truth-console-user", JSON.stringify(data.user));
        setAuthModalOpen(false);
        setAuthUsername("");
        setAuthPassword("");
        setErrorMsg(null);
      } else {
        const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: authUsername,
            email: authEmail,
            password: authPassword
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed");

        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("truth-console-token", data.token);
        localStorage.setItem("truth-console-user", JSON.stringify(data.user));
        setAuthModalOpen(false);
        setAuthUsername("");
        setAuthEmail("");
        setAuthPassword("");
        setErrorMsg(null);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setUserHistory([]);
    setHistoryCount(0);
    localStorage.removeItem("truth-console-token");
    localStorage.removeItem("truth-console-user");
  };

  // Delete history item
  const handleDeleteHistoryItem = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUserHistory((prev) => prev.filter((item) => item.id !== id));
        setHistoryCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all history
  const handleClearAllHistory = async () => {
    if (!token || !confirm("Clear all your search history? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUserHistory([]);
        setHistoryCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Restore history record to console input
  const restoreHistoryItem = (item: HistoryItem) => {
    setTitle(item.headline);
    setText(item.content_preview);
    setHistoryModalOpen(false);
    setResult(null);
  };

  // Fetch Admin Data
  const fetchAdminData = async () => {
    if (!token || currentUser?.role !== "admin") return;
    setAdminLoading(true);
    try {
      const [resStats, resUsers, resLogs] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/v1/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/v1/admin/history?limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (resStats.ok) setAdminStats(await resStats.json());
      if (resUsers.ok) setAdminUsers((await resUsers.json()).users || []);
      if (resLogs.ok) setAdminLogs((await resLogs.json()).logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!token || !confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAdminUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stripe Plan Subscription / Upgrade
  const handleUpgradePlan = async (planId: string) => {
    if (!token) {
      setAuthMode("login");
      setAuthError("Please sign in or create an account to activate a subscription.");
      setAuthModalOpen(true);
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/subscription/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: planId,
          success_url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to initialize Stripe checkout.");

      if (data.mode === "live_stripe" && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        // Test Sandbox Simulator: instant upgrade
        const verifyRes = await fetch(`${API_BASE}/api/v1/subscription/verify-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            session_id: data.session_id,
            plan_id: planId
          })
        });
        const verifyData = await verifyRes.json();
        if (verifyData.status === "success") {
          if (verifyData.token) {
            setToken(verifyData.token);
            localStorage.setItem("truth-console-token", verifyData.token);
          }
          if (verifyData.user) {
            setCurrentUser(verifyData.user);
            localStorage.setItem("truth-console-user", JSON.stringify(verifyData.user));
          }
          setPricingModalOpen(false);
          setQuotaExhaustedModalOpen(false);
          setCheckoutSuccessNotice(`Upgraded to ${planId.toUpperCase()}! You now enjoy UNLIMITED daily fact-checks.`);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"]
          });
        }
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Checkout error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!token || !confirm("Downgrade subscription back to Free Tier (20 daily checks)?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/subscription/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("truth-console-token", data.token);
        }
        if (currentUser) {
          const updated = { ...currentUser, subscription_tier: "free", today_remaining: 20 };
          setCurrentUser(updated);
          localStorage.setItem("truth-console-user", JSON.stringify(updated));
        }
        setPricingModalOpen(false);
        setCheckoutSuccessNotice("Subscription downgraded to Free Tier (20 checks/day).");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Analysis (with 5 guest uses and 20 daily free uses enforcement)
  const handleAnalyze = async () => {
    const combined = `${title} ${text}`.trim();
    if (!combined) {
      setErrorMsg("Please enter a headline or article text to analyze.");
      return;
    }

    // 1. ENFORCE 5 GUEST USES LIMIT FOR NON-LOGGED-IN USERS
    if (!currentUser) {
      if (guestCount >= GUEST_USAGE_LIMIT) {
        setAuthMode("login");
        setAuthError(`You have used all ${GUEST_USAGE_LIMIT} free guest analyses. Please sign in or create an account to continue using the AI Truth Console.`);
        setAuthModalOpen(true);
        setErrorMsg(`Guest quota reached (${GUEST_USAGE_LIMIT}/${GUEST_USAGE_LIMIT}). Sign in to continue.`);
        return;
      }
    } else {
      // 2. ENFORCE 20 DAILY CHECKS FOR FREE REGISTERED USERS
      const isFree = !currentUser.subscription_tier || currentUser.subscription_tier === "free";
      const isNotAdmin = currentUser.role !== "admin";
      if (isFree && isNotAdmin && currentUser.today_remaining === 0) {
        setQuotaExhaustedModalOpen(true);
        setErrorMsg("Daily quota of 20 verifications reached. Upgrade to Pro for unlimited verifications.");
        return;
      }
    }

    setLoading(true);
    setErrorMsg(null);
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/v1/predict`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title, text }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 403 && !currentUser) {
          setAuthMode("login");
          setAuthError(errData.detail || "Guest limit of 5 analyses reached. Please sign in to continue.");
          setAuthModalOpen(true);
        } else if (response.status === 402 || (response.status === 403 && currentUser)) {
          setQuotaExhaustedModalOpen(true);
        }
        throw new Error(errData.detail || `Server error: HTTP ${response.status}`);
      }

      const data: PredictionResult = await response.json();
      setResult(data);

      // Increment guest count for non-logged-in users
      if (!currentUser) {
        const newCount = guestCount + 1;
        setGuestCount(newCount);
        localStorage.setItem("truth-console-guest-count", String(newCount));
      } else {
        // Update user's remaining count in local state
        setCurrentUser((prev) => {
          if (!prev) return null;
          const updatedRemaining = data.daily_remaining !== null && data.daily_remaining !== undefined ? data.daily_remaining : prev.today_remaining;
          const updated = {
            ...prev,
            today_remaining: updatedRemaining,
            today_count: (prev.today_count || 0) + 1,
            subscription_tier: data.subscription_tier || prev.subscription_tier
          };
          localStorage.setItem("truth-console-user", JSON.stringify(updated));
          return updated;
        });
      }

      // Trigger confetti celebration on authentic news
      if (data.label === 0 && data.confidence > 85) {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#06b6d4"]
        });
      }

      // If user is logged in, refresh history count
      if (token) {
        fetchUserHistory();
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to connect to the prediction backend on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleAnalyze();
    }
  };

  const loadPreset = (type: "real" | "fake") => {
    const sample = PRESETS[type];
    setTitle(sample.title);
    setText(sample.text);
    setErrorMsg(null);
    setResult(null);
  };

  const handleClear = () => {
    setTitle("");
    setText("");
    setResult(null);
    setErrorMsg(null);
    setLatency(null);
  };

  const copyResult = () => {
    if (!result) return;
    const textToCopy = `[AI News Verification Report]\nHeadline: "${title || "Untitled"}"\nVerdict: ${result.prediction.toUpperCase()}\nConfidence: ${result.confidence.toFixed(2)}%\nAnalyzed via Machine Learning NLP Engine.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = (title + " " + text).trim().split(/\s+/).filter(Boolean).length;
  const charCount = (title + " " + text).length;

  // Calculate needle angle for the analog truth meter:
  let needleAngle = 0;
  if (result) {
    if (result.label === 0) {
      needleAngle = 10 + (result.confidence / 100) * 60;
    } else {
      needleAngle = -(10 + (result.confidence / 100) * 60);
    }
  }

  const isDark = theme === "dark";
  const guestPassesLeft = Math.max(0, GUEST_USAGE_LIMIT - guestCount);

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none pb-12 transition-colors duration-200 ${
      isDark ? "bg-[#070a10] text-slate-100" : "bg-[#edf2f7] text-slate-800"
    }`}>
      {/* Top Screws & Header Bar */}
      <div className={`w-full border-b transition-colors ${
        isDark
          ? "bg-[#0d121c] border-black/80 shadow-[0_2px_10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "bg-[#f8fafc] border-slate-300 shadow-[0_2px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)]"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand & Console Title */}
          <div className="flex items-center gap-3.5">
            <div className="skeuo-screw hidden sm:block" />
            
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl border-t border-b flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-gradient-to-b from-[#2a3447] to-[#141b27] border-white/20 border-b-black/80 shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "bg-gradient-to-b from-[#ffffff] to-[#e2e8f0] border-white border-b-slate-300 shadow-[0_3px_6px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
              }`}>
                <ShieldCheck className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
              </div>
              
              <div>
                <h1 className={`text-base font-extrabold tracking-wider uppercase ${
                  isDark ? "text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" : "text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                }`}>
                  Truth Console <span className={`text-xs font-semibold tracking-widest ml-1 opacity-90 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>// AI VERIFIER</span>
                </h1>
                <div className={`text-[11px] tracking-wide font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  ANALOG TELEMETRY &bull; POSTGRESQL DB
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Auth, Daily Quota, Pricing, History, Admin, Theme Switch & Jewel Status Lamp */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* User Account / Auth Section */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* User Tag */}
                <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${
                  isDark
                    ? "bg-[#0b0f19] border-black/80 text-slate-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
                    : "bg-slate-100 border-slate-300 text-slate-700 shadow-inner"
                }`}>
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline">@{currentUser.username}</span>
                  {currentUser.role === "admin" && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                      ADMIN
                    </span>
                  )}
                </div>

                {/* Subscription Tier & Daily Quota Badge */}
                {currentUser.subscription_tier === "pro" ? (
                  <button
                    type="button"
                    onClick={() => setPricingModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-sm"
                    title="Pro Subscriber - Unlimited Verifications. Click to manage plan."
                  >
                    <Crown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PRO (UNLIMITED)</span>
                  </button>
                ) : currentUser.subscription_tier === "enterprise" ? (
                  <button
                    type="button"
                    onClick={() => setPricingModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 hover:border-purple-400 transition-all cursor-pointer shadow-sm"
                    title="Enterprise Subscriber - Newsroom Level. Click to manage."
                  >
                    <Crown className="w-3.5 h-3.5 text-purple-400" />
                    <span>ENTERPRISE</span>
                  </button>
                ) : (
                  /* Free Tier User: Show 20 Daily Checks Remaining and Upgrade Button */
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border ${
                        (currentUser.today_remaining ?? (20 - (currentUser.today_count || 0))) > 0
                          ? isDark
                            ? "bg-[#0b0f19] border-slate-800 text-slate-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
                            : "bg-slate-100 border-slate-300 text-slate-700 shadow-inner"
                          : isDark
                          ? "bg-red-950/40 border-red-500/40 text-red-400 animate-pulse"
                          : "bg-red-50 border-red-300 text-red-700"
                      }`}
                      title="Free accounts receive 20 news verifications per day (resets 00:00 UTC)"
                    >
                      <span className="text-[10px] text-slate-500 hidden sm:inline">DAILY:</span>
                      <span className={
                        (currentUser.today_remaining ?? (20 - (currentUser.today_count || 0))) > 0
                          ? "text-sky-400 font-extrabold"
                          : "text-red-400 font-extrabold"
                      }>
                        {Math.max(0, currentUser.today_remaining !== undefined && currentUser.today_remaining !== null ? currentUser.today_remaining : (20 - (currentUser.today_count || 0)))} / 20
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPricingModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-sm hover:shadow-orange-500/20 transition-all cursor-pointer"
                      title="Upgrade to Pro with Stripe for Unlimited Verifications"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">UPGRADE</span>
                    </button>
                  </div>
                )}

                {/* History Button */}
                <button
                  type="button"
                  onClick={() => {
                    fetchUserHistory();
                    setHistoryModalOpen(true);
                  }}
                  className={`skeuo-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                    isDark ? "text-sky-300" : "text-sky-700 border border-slate-200"
                  }`}
                  title="View your personal search history stored in PostgreSQL"
                >
                  <History className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">HISTORY</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-800"
                  }`}>
                    {historyCount}
                  </span>
                </button>

                {/* Admin Telemetry Button (Only for Admin role) */}
                {currentUser.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => {
                      fetchAdminData();
                      setAdminModalOpen(true);
                    }}
                    className={`skeuo-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                      isDark ? "text-amber-300" : "text-amber-700 border border-slate-200"
                    }`}
                    title="Open Administrator Management & Telemetry Console"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline">ADMIN</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`skeuo-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer ${
                    isDark ? "text-red-400" : "text-red-600 border border-slate-200"
                  }`}
                  title="Sign out of console"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">EXIT</span>
                </button>
              </div>
            ) : (
              /* Non-Logged In User Section: Show Guest Limit Badge, Pricing & Login Button */
              <div className="flex items-center gap-2">
                <div
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border flex items-center gap-1.5 ${
                    guestPassesLeft > 0
                      ? isDark
                        ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                      : isDark
                      ? "bg-red-950/60 text-red-400 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse"
                      : "bg-red-50 text-red-700 border-red-300"
                  }`}
                  title="Non-logged in guests receive 5 free analyses before login is required"
                >
                  <span>GUEST:</span>
                  <span className="font-extrabold">{guestPassesLeft} / {GUEST_USAGE_LIMIT} LEFT</span>
                </div>

                <button
                  type="button"
                  onClick={() => setPricingModalOpen(true)}
                  className={`skeuo-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer ${
                    isDark ? "text-amber-400" : "text-amber-700 border border-slate-200"
                  }`}
                  title="View Subscription Plans & Pricing"
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">PLANS</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError(null);
                    setAuthModalOpen(true);
                  }}
                  className={`skeuo-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                    isDark ? "text-indigo-300" : "text-indigo-700 border border-slate-200"
                  }`}
                >
                </button>
              </div>
            )}

            {/* Skeuomorphic Rocker Theme Switch */}
            <div className={`flex items-center p-1 rounded-xl border ${
              isDark
                ? "bg-[#090c13] border-black/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]"
                : "bg-slate-200/80 border-slate-300 shadow-[inset_0_2px_4px_rgba(15,23,42,0.1)]"
            }`}>
              <button
                type="button"
                onClick={() => setTheme("white")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  !isDark
                    ? "bg-white text-slate-800 shadow-[0_2px_4px_rgba(15,23,42,0.15),inset_0_1px_0_rgba(255,255,255,1)] border border-slate-200"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="Switch to White Mode"
              >
                <Sun className={`w-3.5 h-3.5 ${!isDark ? "text-amber-500" : "text-slate-500"}`} />
                <span className="hidden sm:inline">WHITE</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  isDark
                    ? "bg-[#1e2430] text-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] border border-white/10"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="Switch to Dark Mode"
              >
                <Moon className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-slate-500"}`} />
                <span className="hidden sm:inline">DARK</span>
              </button>
            </div>

            {/* Physical Status Lamp */}
            <div className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border ${
              isDark
                ? "bg-[#080b12] border-t-black border-b-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)]"
                : "bg-white border-slate-200 shadow-[inset_0_1px_3px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,1)]"
            }`}>
              <div className="skeuo-jewel-collar">
                <div className={apiOnline === true ? "skeuo-jewel-led-green" : "skeuo-jewel-led-red"} />
              </div>
              <span className={`text-[11px] font-mono font-semibold tracking-wider hidden sm:inline ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {apiOnline === true ? "READY" : apiOnline === false ? "OFFLINE" : "WAIT..."}
              </span>
            </div>

            <div className="skeuo-screw hidden sm:block" />
          </div>
        </div>
      </div>

      {/* Main Console Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Offline Alert */}
        {apiOnline === false && (
          <div className={`skeuo-chassis p-4 border flex items-center justify-between gap-4 ${
            isDark
              ? "bg-gradient-to-r from-red-950/40 via-red-900/20 to-slate-900/60 border-red-500/30 text-red-200"
              : "bg-gradient-to-r from-red-50 via-white to-red-50 border-red-300 text-red-900"
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />
              <div className="text-xs">
                <span className="font-bold">FastAPI Connection Offline:</span> Prediction server on port 8000 is unreachable. Run <code className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${isDark ? "bg-black/50" : "bg-red-100 text-red-950"}`}>uvicorn app.main:app --port 8000</code>.
              </div>
            </div>
            <button
              onClick={checkHealth}
              className={`skeuo-btn px-3 py-1.5 rounded-lg text-xs font-mono ${isDark ? "text-slate-200" : "text-slate-700"}`}
            >
              RETRY
            </button>
          </div>
        )}

        {/* Guest Limit Alert Banner when exhausted */}
        {!currentUser && guestPassesLeft === 0 && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 shadow-lg ${
            isDark
              ? "bg-gradient-to-r from-amber-950/60 via-red-950/40 to-slate-900/80 border-amber-500/40 text-amber-200"
              : "bg-gradient-to-r from-amber-50 via-white to-amber-50 border-amber-300 text-amber-900"
          }`}>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs font-mono">
                <span className="font-bold uppercase">Guest Free Limit Reached (5/5 Used):</span> You have utilized all 5 complimentary verifications. Please sign in or register to unlock unlimited article analyses and PostgreSQL search archiving.
              </div>
            </div>
            <button
              onClick={() => {
                setAuthMode("register");
                setAuthError(null);
                setAuthModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
            >
              REGISTER / SIGN IN
            </button>
          </div>
        )}

        {/* 2-Column Physical Workstation Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =========================================================================
              LEFT DECK: INPUT CONSOLE (7 cols)
              ========================================================================= */}
          <div className="lg:col-span-7 skeuo-chassis p-6 sm:p-7 space-y-6">
            
            {/* Header & Corner Screws */}
            <div className={`flex items-center justify-between pb-4 border-b ${
              isDark
                ? "border-black/60 shadow-[0_1px_0_rgba(255,255,255,0.06)]"
                : "border-slate-200 shadow-[0_1px_0_rgba(255,255,255,0.8)]"
            }`}>
              <div className="flex items-center gap-2">
                <div className="skeuo-screw" />
                <span className={`text-xs font-bold tracking-widest uppercase font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  INPUT PANEL // ARTICLE INGESTION
                </span>
              </div>

              {/* Physical Preset Keys */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => loadPreset("real")}
                  className={`skeuo-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                    isDark ? "text-emerald-400" : "text-emerald-700 border border-slate-200/80"
                  }`}
                  title="Load verified genuine article sample"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  SAMPLE REAL
                </button>

                <button
                  type="button"
                  onClick={() => loadPreset("fake")}
                  className={`skeuo-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                    isDark ? "text-red-400" : "text-red-700 border border-slate-200/80"
                  }`}
                  title="Load fabricated sensationalist article sample"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                  SAMPLE FAKE
                </button>
              </div>
            </div>

            {/* Headline / Title Input Well */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold tracking-wider uppercase font-mono flex items-center gap-1.5 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  <FileText className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                  HEADLINE / TITLE
                </label>
                <span className={`text-[10px] font-mono font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>OPTIONAL</span>
              </div>
              <div className={`skeuo-inset rounded-xl p-1.5 ${!isDark ? "border border-slate-200" : ""}`}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter news headline or claim..."
                  className={`w-full bg-transparent px-3 py-2 text-sm font-mono focus:outline-none ${
                    isDark ? "text-slate-100 placeholder-slate-600" : "text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            {/* Article Body Textarea Well */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold tracking-wider uppercase font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  ARTICLE BODY TEXT
                </label>
                <div className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isDark
                    ? "bg-[#06080d] border border-black/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] text-indigo-300/80"
                    : "bg-slate-100 border border-slate-200 shadow-inner text-indigo-800"
                }`}>
                  {wordCount.toString().padStart(3, "0")} WORDS &bull; {charCount.toString().padStart(4, "0")} CHARS
                </div>
              </div>
              <div className={`skeuo-inset rounded-xl p-2 ${!isDark ? "border border-slate-200" : ""}`}>
                <textarea
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste complete article content or paragraphs here to inspect for misinformation patterns..."
                  className={`w-full bg-transparent px-2 py-1 text-sm font-mono leading-relaxed resize-y min-h-[170px] focus:outline-none ${
                    isDark ? "text-slate-200 placeholder-slate-600" : "text-slate-800 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            {/* Tactile Control Buttons Bar */}
            <div className={`pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t ${
              isDark
                ? "border-black/60 shadow-[0_1px_0_rgba(255,255,255,0.06)]"
                : "border-slate-200 shadow-[0_1px_0_rgba(255,255,255,0.8)]"
            }`}>
              
              {/* Keyboard Stamp */}
              <div className={`flex items-center gap-1.5 text-[11px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                <span className={`px-1.5 py-0.5 rounded font-bold shadow-[0_2px_0_#cbd5e1] border-t border-b ${
                  isDark
                    ? "bg-[#131924] border-t-white/20 border-b-black text-slate-300 shadow-[0_2px_0_#070a10]"
                    : "bg-white border-t-white border-b-slate-300 text-slate-800"
                }`}>
                  CTRL
                </span>
                <span>+</span>
                <span className={`px-1.5 py-0.5 rounded font-bold shadow-[0_2px_0_#cbd5e1] border-t border-b ${
                  isDark
                    ? "bg-[#131924] border-t-white/20 border-b-black text-slate-300 shadow-[0_2px_0_#070a10]"
                    : "bg-white border-t-white border-b-slate-300 text-slate-800"
                }`}>
                  ENTER
                </span>
                <span className={`ml-1 font-semibold ${isDark ? "text-slate-500" : "text-slate-500"}`}>EXECUTE</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {(title || text) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={`skeuo-btn px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                    CLEAR
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading || (!title.trim() && !text.trim())}
                  className={`skeuo-btn-primary flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-mono font-extrabold tracking-wider text-white flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
                    !currentUser && guestPassesLeft === 0 ? "opacity-75 ring-2 ring-amber-500" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>PROCESSING INFERENCE...</span>
                    </>
                  ) : !currentUser && guestPassesLeft === 0 ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>SIGN IN TO ANALYZE</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-sky-100" />
                      <span>ANALYZE ARTICLE</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-100" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2.5 shadow-inner ${
                isDark
                  ? "bg-red-950/60 border-red-500/40 text-red-200"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                <AlertTriangle className={`w-4 h-4 shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Bottom Corner Screws & Auth Tip */}
            <div className="flex items-center justify-between pt-2">
              <div className="skeuo-screw" />
              {!currentUser ? (
                <div className="text-[11px] font-mono text-slate-500">
                  <span className="text-amber-400 font-bold">GUEST USAGE:</span> {guestPassesLeft} of {GUEST_USAGE_LIMIT} free analyses available. Sign in for unlimited analyses &amp; PostgreSQL archiving.
                </div>
              ) : (
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Authenticated as @{currentUser.username} &bull; Unlimited verifications enabled</span>
                </div>
              )}
              <div className="skeuo-screw" />
            </div>
          </div>

          {/* =========================================================================
              RIGHT DECK: ANALOG TRUTH GAUGE & VERDICT PLAQUE (5 cols)
              ========================================================================= */}
          <div className="lg:col-span-5 skeuo-chassis p-6 sm:p-7 space-y-6">
            
            {/* Telemetry Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDark
                ? "border-black/60 shadow-[0_1px_0_rgba(255,255,255,0.06)]"
                : "border-slate-200 shadow-[0_1px_0_rgba(255,255,255,0.8)]"
            }`}>
              <div className="flex items-center gap-2">
                <div className="skeuo-screw" />
                <span className={`text-xs font-bold tracking-widest uppercase font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  TELEMETRY // TRUTH GAUGE
                </span>
              </div>
              <Gauge className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
            </div>

            {/* Precision Analog VU Meter */}
            <div className={`relative skeuo-inset rounded-2xl p-5 overflow-hidden flex flex-col items-center border ${
              isDark
                ? "bg-[#090c13] border-transparent"
                : "border-slate-200 bg-gradient-to-b from-white to-[#f1f5f9]"
            }`}>
              
              {/* Glass Reflection Highlight */}
              <div className="absolute inset-0 skeuo-glass-reflection rounded-2xl" />

              {/* Gauge Dial Face */}
              <div className="relative w-full max-w-[280px] h-[145px] overflow-hidden flex flex-col items-center">
                
                <svg viewBox="0 0 240 130" className={`w-full h-full ${isDark ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "drop-shadow-[0_2px_4px_rgba(15,23,42,0.12)]"}`}>
                  {/* Outer Bezel Arc */}
                  <path
                    d="M 20 120 A 100 100 0 0 1 220 120"
                    fill="none"
                    stroke={isDark ? "#1e293b" : "#cbd5e1"}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  
                  {/* Red Zone: Fake */}
                  <path
                    d="M 20 120 A 100 100 0 0 1 80 40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className={isDark ? "opacity-80" : ""}
                  />

                  {/* Amber Neutral Zone */}
                  <path
                    d="M 80 40 A 100 100 0 0 1 160 40"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    className={isDark ? "opacity-75" : ""}
                  />

                  {/* Green Zone: Real */}
                  <path
                    d="M 160 40 A 100 100 0 0 1 220 120"
                    fill="none"
                    stroke={isDark ? "#22c55e" : "#10b981"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    className={isDark ? "opacity-85" : ""}
                  />

                  {/* Precision Tick Marks */}
                  <line x1="28" y1="110" x2="38" y2="105" stroke={isDark ? "#94a3b8" : "#475569"} strokeWidth="1.5" />
                  <line x1="60" y1="62" x2="68" y2="70" stroke={isDark ? "#94a3b8" : "#475569"} strokeWidth="1.5" />
                  <line x1="120" y1="20" x2="120" y2="30" stroke={isDark ? "#94a3b8" : "#1e293b"} strokeWidth="2" />
                  <line x1="180" y1="62" x2="172" y2="70" stroke={isDark ? "#94a3b8" : "#475569"} strokeWidth="1.5" />
                  <line x1="212" y1="110" x2="202" y2="105" stroke={isDark ? "#94a3b8" : "#475569"} strokeWidth="1.5" />

                  {/* Scale Labels */}
                  <text x="22" y="128" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">FAKE</text>
                  <text x="108" y="42" fill={isDark ? "#94a3b8" : "#475569"} fontSize="8" fontFamily="monospace" fontWeight="bold">CALIBRATED</text>
                  <text x="195" y="128" fill={isDark ? "#22c55e" : "#059669"} fontSize="8" fontFamily="monospace" fontWeight="bold">REAL</text>
                </svg>

                {/* The Physical Needle */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-[98px] origin-bottom transition-transform duration-1000 ease-out"
                  style={{
                    transform: `translateX(-50%) rotate(${needleAngle}deg)`,
                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
                  }}
                >
                  <div className={`w-full h-full rounded-t-full ${
                    isDark
                      ? "bg-gradient-to-t from-red-600 via-orange-400 to-amber-200 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                      : "bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                  }`} />
                </div>

                {/* Heavy Center Pivot Cap */}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  isDark
                    ? "bg-gradient-to-b from-[#64748b] via-[#334155] to-[#0f172a] border-[#1e293b] shadow-[0_2px_6px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.4)]"
                    : "bg-gradient-to-b from-[#ffffff] via-[#e2e8f0] to-[#94a3b8] border-slate-300 shadow-[0_2px_6px_rgba(15,23,42,0.2),inset_0_1px_2px_rgba(255,255,255,0.9)]"
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full border shadow-inner ${
                    isDark ? "bg-[#0b0f19] border-white/20" : "bg-slate-700 border-white"
                  }`} />
                </div>
              </div>

              {/* Meter Calibration Readout */}
              <div className={`w-full mt-3 pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
                isDark ? "border-black/80" : "border-slate-200"
              }`}>
                <span className={`font-semibold ${isDark ? "text-slate-500" : "text-slate-500"}`}>METER STATUS</span>
                <span className={`font-bold ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                  {result ? (result.label === 0 ? "AUTHENTIC RANGE" : "DECEPTIVE RANGE") : "STANDBY // IDLE"}
                </span>
              </div>
            </div>

            {/* Verdict Plaque */}
            {result ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div
                  className={`p-5 rounded-2xl border shadow-xl relative overflow-hidden ${
                    result.label === 0
                      ? isDark
                        ? "bg-gradient-to-b from-[#0e271a] via-[#091b12] to-[#050f0a] border-t-emerald-400/40 border-l-emerald-500/20 border-r-black border-b-black shadow-[0_8px_20px_rgba(16,185,129,0.25)]"
                        : "bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#dcfce7] border-emerald-300 shadow-[0_8px_20px_rgba(16,185,129,0.15)]"
                      : isDark
                        ? "bg-gradient-to-b from-[#2d1214] via-[#1f0b0d] to-[#120507] border-t-red-400/40 border-l-red-500/20 border-r-black border-b-black shadow-[0_8px_20px_rgba(239,68,68,0.25)]"
                        : "bg-gradient-to-b from-[#fef2f2] via-[#fff1f2] to-[#fee2e2] border-red-300 shadow-[0_8px_20px_rgba(239,68,68,0.15)]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}>
                          OFFICIAL VERDICT
                        </span>
                        {result.saved_to_history && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Database className="w-2.5 h-2.5" /> SAVED TO DB
                          </span>
                        )}
                        {!currentUser && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            GUEST: {guestPassesLeft} LEFT
                          </span>
                        )}
                      </div>
                      <h3
                        className={`text-xl font-black tracking-wider uppercase font-mono mt-0.5 ${
                          result.label === 0
                            ? isDark ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "text-emerald-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                            : isDark ? "text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]" : "text-red-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                        }`}
                      >
                        {result.label === 0 ? "VERIFIED AUTHENTIC" : "FABRICATED / FAKE"}
                      </h3>
                    </div>

                    <div className="skeuo-jewel-collar">
                      <div className={result.label === 0 ? "skeuo-jewel-led-green" : "skeuo-jewel-led-red"} />
                    </div>
                  </div>

                  <p className={`mt-2.5 text-xs font-sans leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {result.label === 0
                      ? "Article exhibits semantic coherence and neutral syntax conforming to credible journalism."
                      : "Article exhibits high-frequency sensationalist markers and syntax indicative of misinformation."}
                  </p>

                  {/* Metrics Strip */}
                  <div className={`mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-xs font-mono ${
                    isDark ? "border-black/80" : "border-slate-200/80"
                  }`}>
                    <div className={`skeuo-inset p-2 rounded-lg ${!isDark ? "border border-slate-200" : ""}`}>
                      <div className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>CONFIDENCE</div>
                      <div
                        className={`text-base font-extrabold ${
                          result.label === 0
                            ? isDark ? "text-emerald-400" : "text-emerald-700"
                            : isDark ? "text-red-400" : "text-red-700"
                        }`}
                      >
                        {result.confidence.toFixed(2)}%
                      </div>
                    </div>

                    <div className={`skeuo-inset p-2 rounded-lg ${!isDark ? "border border-slate-200" : ""}`}>
                      <div className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>LATENCY</div>
                      <div className={`text-base font-extrabold ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                        {latency ? `${latency} ms` : "< 15 ms"}
                      </div>
                    </div>
                  </div>

                  {/* Tactile Copy Button */}
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                    isDark ? "border-black/80" : "border-slate-200/80"
                  }`}>
                    <span className={`text-[10px] font-mono font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      OUTPUT ID #{Math.floor(result.confidence * 123).toString(16).toUpperCase()}
                    </span>

                    <button
                      type="button"
                      onClick={copyResult}
                      className={`skeuo-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                          <span className={isDark ? "text-emerald-400" : "text-emerald-700"}>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                          <span>COPY VERDICT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Standby State Plaque */
              <div className={`skeuo-inset p-6 rounded-2xl text-center space-y-3 flex flex-col items-center justify-center min-h-[160px] border ${
                isDark ? "border-transparent bg-transparent" : "border-slate-200 bg-white/70"
              }`}>
                <Activity className={`w-6 h-6 opacity-80 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                <div className="space-y-1">
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    CONSOLE IN STANDBY
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs font-mono leading-relaxed">
                    Insert headline and article body into the left console or select a preset switch to execute telemetry.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Screws */}
            <div className="flex items-center justify-between pt-2">
              <div className="skeuo-screw" />
              <div className="skeuo-screw" />
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODAL 1: AUTHENTICATION (LOGIN / REGISTER)
          ========================================================================= */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md skeuo-chassis p-6 sm:p-7 rounded-2xl border shadow-2xl relative ${
            isDark ? "bg-[#0f1420] border-slate-700" : "bg-white border-slate-300"
          }`}>
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-base uppercase text-slate-100">
                  {authMode === "login" ? "Console Access // Login" : "Operator Enrollment // Sign Up"}
                </h3>
                <div className="text-[11px] font-mono text-slate-400">
                  PostgreSQL Authenticated Session
                </div>
              </div>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex items-center gap-2 my-4 p-1 rounded-xl bg-black/30 border border-slate-800">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthError(null); }}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === "login"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setAuthError(null); }}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === "register"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-300">
                  {authMode === "login" ? "Username or Email" : "Username"}
                </label>
                <div className="skeuo-inset rounded-lg p-1.5">
                  <input
                    type="text"
                    required
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder={authMode === "login" ? "e.g. admin or username" : "Choose username"}
                    className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono focus:outline-none text-slate-100 placeholder-slate-500"
                  />
                </div>
              </div>

              {authMode === "register" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-300">
                    Email Address
                  </label>
                  <div className="skeuo-inset rounded-lg p-1.5">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono focus:outline-none text-slate-100 placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-300">
                  Password
                </label>
                <div className="skeuo-inset rounded-lg p-1.5">
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono focus:outline-none text-slate-100 placeholder-slate-500"
                  />
                </div>
                {authMode === "login" && (
                  <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                    Default Administrator: <code className="text-amber-400">admin</code> / <code className="text-amber-400">admin123</code>
                  </div>
                )}
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full skeuo-btn-primary py-2.5 rounded-xl text-xs font-mono font-extrabold tracking-wider text-white flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>{authMode === "login" ? "AUTHENTICATE SESSION" : "REGISTER OPERATOR"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SEARCH HISTORY DRAWER
          ========================================================================= */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[85vh] flex flex-col skeuo-chassis p-6 rounded-2xl border shadow-2xl relative ${
            isDark ? "bg-[#0f1420] border-slate-700" : "bg-white border-slate-300"
          }`}>
            <button
              onClick={() => setHistoryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* History Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-base uppercase text-slate-100 flex items-center gap-2">
                    Search History <span className="text-xs text-sky-400 font-normal">({userHistory.length} records)</span>
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    Archived in PostgreSQL for @{currentUser?.username}
                  </div>
                </div>
              </div>

              {userHistory.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>CLEAR ALL</span>
                </button>
              )}
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto my-4 space-y-2.5 pr-1">
              {historyLoading ? (
                <div className="py-12 text-center text-slate-400 font-mono text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
                  <span>Loading query history from PostgreSQL database...</span>
                </div>
              ) : userHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs space-y-2">
                  <Database className="w-8 h-8 mx-auto opacity-50 text-slate-600" />
                  <div>No search history found in database.</div>
                  <div className="text-[11px] text-slate-600">Run an analysis while signed in to automatically record searches.</div>
                </div>
              ) : (
                userHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isDark
                        ? "bg-[#090d16] border-slate-800 hover:border-slate-700"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            item.label === 0
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {item.prediction}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-300">
                          {Number(item.confidence).toFixed(2)}%
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          &bull; {item.latency_ms}ms
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          &bull; {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="font-mono text-xs font-semibold text-slate-200 truncate">
                        {item.headline || "Untitled Article"}
                      </div>
                      <p className="text-[11px] font-sans text-slate-400 line-clamp-2 leading-relaxed">
                        {item.content_preview}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={() => restoreHistoryItem(item)}
                        className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30 transition-all cursor-pointer"
                        title="Load into active console"
                      >
                        LOAD
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>TABLE: <code className="text-slate-400 font-bold">prediction_history</code></span>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="skeuo-btn px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-300 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADMINISTRATOR TELEMETRY & MANAGEMENT CONSOLE
          ========================================================================= */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl max-h-[88vh] flex flex-col skeuo-chassis p-6 rounded-2xl border shadow-2xl relative ${
            isDark ? "bg-[#0f1420] border-slate-700" : "bg-white border-slate-300"
          }`}>
            <button
              onClick={() => setAdminModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Admin Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-base uppercase text-slate-100 flex items-center gap-2">
                  Admin Telemetry &amp; System Governance
                </h3>
                <div className="text-[11px] font-mono text-slate-400">
                  Raw SQL PostgreSQL Engine Metrics &bull; Multi-User Supervision
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 my-4 border-b border-slate-700/40 pb-2">
              <button
                onClick={() => setAdminTab("stats")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  adminTab === "stats"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                METRICS SUMMARY
              </button>
              <button
                onClick={() => setAdminTab("users")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  adminTab === "users"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                USERS DIRECTORY ({adminUsers.length})
              </button>
              <button
                onClick={() => setAdminTab("logs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  adminTab === "logs"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                GLOBAL AUDIT LOGS ({adminLogs.length})
              </button>
            </div>

            {/* Admin Content Area */}
            <div className="flex-1 overflow-y-auto pr-1">
              {adminLoading ? (
                <div className="py-16 text-center text-slate-400 font-mono text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Aggregating PostgreSQL telemetry data via Raw SQL...</span>
                </div>
              ) : adminTab === "stats" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Registered Users</div>
                      <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                        {adminStats?.total_users || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Total Predictions</div>
                      <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                        {adminStats?.total_predictions || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Active Today</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        {adminStats?.active_today || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Real Predictions</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        {adminStats?.real_predictions || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Fake Predictions</div>
                      <div className="text-xl font-bold font-mono text-red-400 mt-1">
                        {adminStats?.fake_predictions || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Average Latency</div>
                      <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                        {adminStats?.avg_latency || 0} ms
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs font-mono text-slate-400 space-y-1.5">
                    <div className="text-slate-300 font-bold">SQL Database Diagnostics:</div>
                    <div>&bull; Database Engine: PostgreSQL 18 (Localhost:5432)</div>
                    <div>&bull; Query Layer: Pure Raw SQL (Zero ORM overhead)</div>
                    <div>&bull; Tables Active: <code className="text-amber-400">users</code>, <code className="text-amber-400">prediction_history</code></div>
                  </div>
                </div>
              ) : adminTab === "users" ? (
                <div className="space-y-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                          <th className="py-2 px-3">ID</th>
                          <th className="py-2 px-3">User</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Role</th>
                          <th className="py-2 px-3">Searches</th>
                          <th className="py-2 px-3">Joined</th>
                          <th className="py-2 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {adminUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 text-slate-500">#{u.id}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-200">{u.username}</td>
                            <td className="py-2.5 px-3 text-slate-400">{u.email}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                u.role === "admin" ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-300"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-sky-400 font-bold">{u.prediction_count}</td>
                            <td className="py-2.5 px-3 text-slate-500 text-[10px]">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {u.role !== "admin" && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Global Audit Logs */
                <div className="space-y-2">
                  {adminLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start justify-between gap-3 text-xs font-mono"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            log.prediction === "Real News" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            {log.prediction}
                          </span>
                          <span className="text-slate-300 font-bold">{log.confidence}%</span>
                          <span className="text-slate-500">&bull; {log.latency_ms}ms</span>
                          <span className="text-indigo-400 font-semibold">&bull; @{log.username || "Guest"}</span>
                        </div>
                        <div className="text-slate-200 truncate font-semibold">{log.headline}</div>
                        <div className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Footer */}
            <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
              <button
                type="button"
                onClick={fetchAdminData}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>REFRESH TELEMETRY</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="skeuo-btn px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-300 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: STRIPE SUBSCRIPTION & UPGRADE PRICING CONSOLE
          ========================================================================= */}
      {pricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col skeuo-chassis p-6 sm:p-7 rounded-2xl border shadow-2xl relative overflow-y-auto ${
            isDark ? "bg-[#0b0f19] border-slate-700" : "bg-white border-slate-300"
          }`}>
            <button
              onClick={() => setPricingModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-700/50">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-lg uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  Subscription Monetization <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">STRIPE GATEWAY</span>
                </h3>
                <div className="text-xs font-mono text-slate-400">
                  Upgrade your truth verification capacity &bull; Cancel anytime
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              
              {/* PLAN 1: FREE STARTER */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                (!currentUser?.subscription_tier || currentUser?.subscription_tier === "free")
                  ? "border-sky-500/60 bg-sky-950/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]"
                  : isDark ? "bg-[#090d16] border-slate-800" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-400">STARTER</span>
                    {(!currentUser?.subscription_tier || currentUser?.subscription_tier === "free") && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">CURRENT PLAN</span>
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-black text-slate-100">$0 <span className="text-xs font-normal text-slate-400">/ forever</span></div>
                    <p className="text-xs text-slate-400 mt-1">Essential fact-checking tools for everyday casual readers.</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span><strong>20 Daily</strong> AI Verifications</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>PassiveAggressive NLP (96.87%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Last 50 Search History</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>Standard Processing Speed</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4">
                  {(!currentUser?.subscription_tier || currentUser?.subscription_tier === "free") ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl font-mono text-xs font-bold bg-slate-800 text-slate-400 cursor-default text-center"
                    >
                      ACTIVE TIER
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      className="w-full py-2.5 rounded-xl font-mono text-xs font-bold border border-slate-700 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
                    >
                      DOWNGRADE TO FREE
                    </button>
                  )}
                </div>
              </div>

              {/* PLAN 2: PRO VERIFIER (RECOMMENDED) */}
              <div className="p-5 rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-amber-950/20 via-[#0e1422] to-[#090d16] shadow-[0_0_25px_rgba(245,158,11,0.2)] flex flex-col justify-between relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-mono font-black tracking-widest uppercase shadow-md">
                  ★ MOST POPULAR ★
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-400">PRO VERIFIER</span>
                    {currentUser?.subscription_tier === "pro" && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">CURRENT PLAN</span>
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-black text-slate-100">$9.99 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                    <p className="text-xs text-slate-400 mt-1">Built for journalists, researchers, and professional content creators.</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-current" />
                      <span>UNLIMITED Daily Verifications</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>High-Priority Pipeline (&lt;50ms)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Full History Search &amp; Re-run</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>CSV/JSON Data Audit Export</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Verified Pro Badge on Console</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4">
                  {currentUser?.subscription_tier === "pro" ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl font-mono text-xs font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default text-center"
                    >
                      ACTIVE PRO PLAN
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgradePlan("pro")}
                      disabled={checkoutLoading}
                      className="w-full py-2.5 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer font-extrabold"
                    >
                      {checkoutLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>CONNECTING TO STRIPE...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>UPGRADE WITH STRIPE ($9.99)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* PLAN 3: ENTERPRISE */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                currentUser?.subscription_tier === "enterprise"
                  ? "border-purple-500/60 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : isDark ? "bg-[#090d16] border-slate-800" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-purple-400">ENTERPRISE</span>
                    {currentUser?.subscription_tier === "enterprise" && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">CURRENT PLAN</span>
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-black text-slate-100">$49.99 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                    <p className="text-xs text-slate-400 mt-1">Full-scale mitigation suite for newsrooms, publishers, and platforms.</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-purple-300 font-bold">
                      <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0 fill-current" />
                      <span>Unlimited for Full Newsroom</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Dedicated REST API &amp; Webhooks</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Custom Fine-Tuned NLP Models</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>99.9% High Availability SLA</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>24/7 Dedicated Account Engineer</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4">
                  {currentUser?.subscription_tier === "enterprise" ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl font-mono text-xs font-bold bg-purple-600/30 text-purple-300 border border-purple-500/40 cursor-default text-center"
                    >
                      ACTIVE ENTERPRISE PLAN
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgradePlan("enterprise")}
                      disabled={checkoutLoading}
                      className="w-full py-2.5 rounded-xl font-mono text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer font-extrabold shadow-md"
                    >
                      {checkoutLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>CONNECTING...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>UPGRADE ($49.99)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Security & Sandbox Notice Footer */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PCI-DSS Compliant via Stripe &bull; 256-Bit SSL &bull; Sandbox Simulator Active</span>
              </div>
              <button
                type="button"
                onClick={() => setPricingModalOpen(false)}
                className="skeuo-btn px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-300 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: DAILY FREE QUOTA EXHAUSTED (20/20) ALERT MODAL
          ========================================================================= */}
      {quotaExhaustedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md skeuo-chassis p-6 rounded-2xl border border-red-500/50 shadow-2xl relative text-center ${
            isDark ? "bg-[#0d121e]" : "bg-white"
          }`}>
            <button
              onClick={() => setQuotaExhaustedModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/20 mb-4 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="font-mono font-black text-lg uppercase tracking-wider text-slate-100 mb-2">
              Daily Limit Reached (20/20)
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-mono">
              You have completed all <strong className="text-amber-400">20 free news verifications</strong> allocated for your account today.
              Your daily limit automatically resets every 24 hours at 00:00 UTC.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setQuotaExhaustedModalOpen(false);
                  handleUpgradePlan("pro");
                }}
                disabled={checkoutLoading}
                className="w-full py-3 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>UPGRADE TO PRO — UNLIMITED ($9.99/MO)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuotaExhaustedModalOpen(false);
                  setPricingModalOpen(true);
                }}
                className="w-full py-2 rounded-xl font-mono text-xs font-bold border border-slate-700 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
              >
                VIEW ALL PLANS
              </button>

              <button
                type="button"
                onClick={() => setQuotaExhaustedModalOpen(false)}
                className="text-[11px] font-mono text-slate-500 hover:text-slate-400 cursor-pointer pt-1"
              >
                I will wait for tomorrow's reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Success Floating Notification Banner */}
      {checkoutSuccessNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-gradient-to-r from-emerald-950/90 to-slate-900/90 border border-emerald-500/50 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs font-mono">
            <div className="text-emerald-400 font-bold uppercase tracking-wider mb-1">Subscription Upgraded!</div>
            <p className="text-slate-200">{checkoutSuccessNotice}</p>
          </div>
          <button
            onClick={() => setCheckoutSuccessNotice(null)}
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <footer className={`mt-auto border-t py-4 text-center text-xs font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
        isDark
          ? "border-black/80 bg-[#090c13] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "border-slate-300 bg-[#f8fafc] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
      }`}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
            <span className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>AI TRUTH CONSOLE // ACTIVE</span>
          </div>
          <div>PASSIVE-AGGRESSIVE NLP CLASSIFIER &bull; POSTGRESQL DB</div>
        </div>
      </footer>
    </div>
  );
}
