"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, HistoryItem } from "@/types";
import { api } from "@/lib/api";
import { GUEST_USAGE_LIMIT } from "@/constants/presets";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  theme: "dark" | "white";
  setTheme: (t: "dark" | "white") => void;
  isDark: boolean;
  
  // Auth & User
  token: string | null;
  currentUser: UserProfile | null;
  guestCount: number;
  apiOnline: boolean | null;
  
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  incrementGuestCount: () => number;
  
  // Modals state
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  pricingModalOpen: boolean;
  setPricingModalOpen: (open: boolean) => void;
  historyModalOpen: boolean;
  setHistoryModalOpen: (open: boolean) => void;
  adminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;
  quotaModalOpen: boolean;
  setQuotaModalOpen: (open: boolean) => void;
  
  // Toast notifications
  toast: ToastState;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;

  // History Load
  pendingHistoryLoad: HistoryItem | null;
  setPendingHistoryLoad: (item: HistoryItem | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<"dark" | "white">("dark");
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);

  // History Load
  const [pendingHistoryLoad, setPendingHistoryLoad] = useState<HistoryItem | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "info"
  });

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const setTheme = (newTheme: "dark" | "white") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("truth-console-theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const isDark = theme === "dark";

  // Check backend health
  const checkHealth = useCallback(async () => {
    try {
      const isOnline = await api.checkHealth();
      setApiOnline(isOnline);
    } catch {
      setApiOnline(false);
    }
  }, []);

  // Fetch current user profile
  const refreshUser = useCallback(async () => {
    const savedToken = token || (typeof window !== "undefined" ? localStorage.getItem("truth-console-token") : null);
    if (!savedToken) return;

    try {
      const user = await api.getProfile(savedToken);
      setCurrentUser(user);
    } catch {
      // Token might be invalid or expired
      logout();
    }
  }, [token]);

  const login = (newToken: string, user: UserProfile) => {
    setToken(newToken);
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("truth-console-token", newToken);
    }
    showToast(`Welcome back, ${user.username}!`, "success");
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("truth-console-token");
    }
    showToast("Session terminated. Signed out successfully.", "info");
  };

  const incrementGuestCount = () => {
    const nextCount = guestCount + 1;
    setGuestCount(nextCount);
    if (typeof window !== "undefined") {
      localStorage.setItem("truth-console-guest-count", nextCount.toString());
    }
    return nextCount;
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Theme initialization
    const savedTheme = localStorage.getItem("truth-console-theme") as "dark" | "white" | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.add("dark");
    }

    // Guest usage initialization
    const savedGuest = localStorage.getItem("truth-console-guest-count");
    if (savedGuest) {
      setGuestCount(parseInt(savedGuest, 10) || 0);
    }

    // Token & User Profile
    const savedToken = localStorage.getItem("truth-console-token");
    if (savedToken) {
      setToken(savedToken);
      api.getProfile(savedToken)
        .then((user) => setCurrentUser(user))
        .catch(() => {
          localStorage.removeItem("truth-console-token");
          setToken(null);
        });
    }

    // Health check
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        isDark,
        token,
        currentUser,
        guestCount,
        apiOnline,
        login,
        logout,
        refreshUser,
        incrementGuestCount,
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
        showToast,
        hideToast,
        pendingHistoryLoad,
        setPendingHistoryLoad
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
