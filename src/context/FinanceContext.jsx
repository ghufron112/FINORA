import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { financeService } from "../services/financeService";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import confetti from "canvas-confetti";

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [activePage, setActivePage] = useState("dashboard");
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [insights, setInsights] = useState([]);
  const [financialHealth, setFinancialHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false); // Database / Supabase Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Login / Register Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Profile & Avatar Modal
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // Export / Download Report Modal

  // Theme state (default to light mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("finora_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("finora_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Database PostgreSQL Aktif",
      message: "Koneksi Supabase siap digunakan untuk pencatatan keuangan aman & terisolasi.",
      type: "success",
      time: "Baru saja",
      read: false,
    },
  ]);

  // Load finance data from service using high-speed unified loader
  const loadData = useCallback(async (forcedSession = undefined) => {
    try {
      setLoading(true);
      let currentSession = forcedSession;
      if (currentSession === undefined && isSupabaseConfigured()) {
        const { data } = await supabase.auth.getSession();
        currentSession = data?.session || null;
      }

      const activeUser = currentSession?.user || null;
      financeService.setCachedUserId(activeUser?.id || null);

      const data = await financeService.loadAllUserData(activeUser);

      setSession(currentSession);
      setUser(data.userData);
      setStats(data.statsData);
      setTransactions(data.txList);
      setBudgets(data.budgetList);
      setGoals(data.goalList);
      setInsights(data.insightList);
      setFinancialHealth(data.healthData);
      setCashFlow(data.cashFlowData);
      setCategoryExpenses(data.categoryExpenseData);
    } catch (err) {
      console.error("Failed to load Finora data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Supabase Auth session watcher (Single source of truth)
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
        setAuthLoading(false);

        if (event === "SIGNED_OUT") {
          financeService.handleSignOut();
          setSession(null);
          setUser(null);
          loadData(null);
        } else {
          loadData(currentSession);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setAuthLoading(false);
      loadData(null);
    }
  }, [loadData]);

  // Global Keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ==========================================
  // AUTH METHODS
  // ==========================================
  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Koneksi Supabase belum dikonfigurasi.");
    }

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (fullName || "").trim() || "User";

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName },
      },
    });
    if (error) throw error;

    let activeSession = data?.session || null;

    // If session not returned immediately, attempt auto-sign-in
    if (!activeSession) {
      try {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInData?.session) {
          activeSession = signInData.session;
        }
      } catch {}
    }

    if (activeSession) {
      setSession(activeSession);
      financeService.setCachedUserId(activeSession.user.id);
      await financeService.migrateGuestDataToUser(activeSession.user.id);
      financeService.updateProfile({ fullName: cleanName }).catch(() => {});
      await loadData(activeSession);
      return { success: true, session: activeSession, user: activeSession.user };
    }

    return {
      success: true,
      session: null,
      user: data?.user,
      requireEmailConfirmation: true,
    };
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Koneksi Supabase belum dikonfigurasi.");
    }

    const cleanEmail = (email || "").trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) throw error;

    if (data?.session) {
      setSession(data.session);
      financeService.setCachedUserId(data.session.user.id);
      await financeService.migrateGuestDataToUser(data.session.user.id);
    }

    if (data?.user) {
      const nameToSave =
        data.user.user_metadata?.full_name ||
        (data.user.email ? data.user.email.split("@")[0] : "User");
      financeService.updateProfile({ fullName: nameToSave }).catch(() => {});
    }

    await loadData(data?.session);
    return data;
  };

  const signOut = async () => {
    try {
      setIsProfileModalOpen(false);
      financeService.handleSignOut();
      setSession(null);
      setUser(null);
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      await loadData(null);
    } catch (err) {
      console.warn("Sign out notice:", err);
    }
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Koneksi Supabase belum dikonfigurasi.");
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  };

  // ==========================================
  // TRANSACTION CRUD
  // ==========================================
  const addTransaction = async (txData) => {
    const created = await financeService.addTransaction(txData);
    await loadData();

    const isIncome = txData.type === "income";
    setNotifications((prev) => [
      {
        id: Date.now(),
        title: isIncome ? "Pemasukan Baru Ditambahkan" : "Pengeluaran Baru Dicatat",
        message: `${txData.title}: Rp ${Number(txData.amount).toLocaleString("id-ID")}`,
        type: isIncome ? "success" : "info",
        time: "Baru saja",
        read: false,
      },
      ...prev,
    ]);

    return created;
  };

  const deleteTransaction = async (id) => {
    await financeService.deleteTransaction(id);
    await loadData();
  };

  const addGoal = async (goalData) => {
    const created = await financeService.addGoal(goalData);
    setGoals((prev) => [...prev, created]);
    return created;
  };

  const depositToGoal = async (goalId, amount) => {
    const updated = await financeService.updateGoalDeposit(goalId, amount);
    setGoals(updated);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#5EEAD4", "#60A5FA", "#34D399"],
      });
    } catch {}
  };

  const addBudget = async (budgetData) => {
    const created = await financeService.addBudget(budgetData);
    setBudgets((prev) => [...prev, created]);
    return created;
  };

  const resetUserData = async () => {
    await financeService.resetUserData();
    await loadData();
  };

  const deleteAccount = async () => {
    await financeService.deleteAccount();
    setSession(null);
    setUser(null);
    await loadData();
  };

  const updateProfile = async ({ fullName, avatarUrl }) => {
    const updated = await financeService.updateProfile({ fullName, avatarUrl });
    setUser((prev) => {
      const resolvedName = fullName !== undefined ? fullName : (prev?.name || "User");
      const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}&backgroundColor=0f766e,0d9488&textColor=ffffff`;
      return {
        ...prev,
        name: resolvedName,
        avatar: avatarUrl || fallback,
        hasCustomAvatar: Boolean(avatarUrl),
      };
    });
    await loadData();
    return updated;
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const value = {
    activePage,
    setActivePage,
    session,
    user,
    authLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resetUserData,
    deleteAccount,
    updateProfile,
    stats,
    transactions,
    budgets,
    goals,
    cashFlow,
    categoryExpenses,
    insights,
    financialHealth,
    loading,
    notifications,
    markAllNotificationsRead,
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    isAddGoalModalOpen,
    setIsAddGoalModalOpen,
    isAddBudgetModalOpen,
    setIsAddBudgetModalOpen,
    isSearchModalOpen,
    setIsSearchModalOpen,
    isDbModalOpen,
    setIsDbModalOpen,
    // Aliases for backwards compatibility with existing UI components
    isGasModalOpen: isDbModalOpen,
    setIsGasModalOpen: setIsDbModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    addTransaction,
    deleteTransaction,
    addGoal,
    depositToGoal,
    addBudget,
    refreshData: loadData,
    theme,
    setTheme,
    toggleTheme,
    isConfigured: isSupabaseConfigured(),
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
