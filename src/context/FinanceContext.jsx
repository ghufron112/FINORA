import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { financeService } from "../services/financeService";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import confetti from "canvas-confetti";

const FinanceContext = createContext(null);

const getInitialStoredSession = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          if (parsed?.user || parsed?.access_token) {
            return parsed;
          }
        }
      }
    }
  } catch {}
  return null;
};

export const FinanceProvider = ({ children }) => {
  const initialSession = getInitialStoredSession();
  const initialUser = initialSession?.user || null;
  const initialUserId = initialUser?.id || null;

  const [activePage, setActivePage] = useState("dashboard");
  const [session, setSession] = useState(initialSession);
  const [authLoading, setAuthLoading] = useState(() => !initialSession && isSupabaseConfigured());
  const [user, setUser] = useState(() => {
    if (initialUser) {
      return {
        name:
          initialUser.user_metadata?.full_name ||
          (initialUser.email ? initialUser.email.split("@")[0] : "Pengguna"),
        email: initialUser.email,
        avatar:
          initialUser.user_metadata?.avatar_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            initialUser.email || "Pengguna"
          )}&backgroundColor=0f766e,0d9488&textColor=ffffff`,
        role: "Pengguna Finora",
      };
    }
    return null;
  });

  const [transactions, setTransactions] = useState(() => {
    return initialUserId ? financeService.getLocalTransactions(initialUserId) : [];
  });
  const [budgets, setBudgets] = useState(() => {
    return initialUserId ? financeService.getLocalBudgets(initialUserId) : [];
  });
  const [goals, setGoals] = useState(() => {
    return initialUserId ? financeService.getLocalGoals(initialUserId) : [];
  });
  const [stats, setStats] = useState(() => {
    if (initialUserId) {
      const txs = financeService.getLocalTransactions(initialUserId);
      return financeService.computeStats(txs);
    }
    return null;
  });
  const [cashFlow, setCashFlow] = useState(() => {
    if (initialUserId) {
      const txs = financeService.getLocalTransactions(initialUserId);
      return financeService.computeCashFlow(txs);
    }
    return [];
  });
  const [categoryExpenses, setCategoryExpenses] = useState(() => {
    if (initialUserId) {
      const txs = financeService.getLocalTransactions(initialUserId);
      return financeService.computeCategoryExpenses(txs);
    }
    return [];
  });
  const [financialHealth, setFinancialHealth] = useState(() => {
    if (initialUserId) {
      const txs = financeService.getLocalTransactions(initialUserId);
      return financeService.computeFinancialHealth(txs);
    }
    return null;
  });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

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
  // Load finance data from service using high-speed unified loader (Instant Stale-While-Revalidate)
  const loadData = useCallback(async (forcedSession = undefined) => {
    try {
      let currentSession = forcedSession;
      if (currentSession === undefined && isSupabaseConfigured()) {
        const { data } = await supabase.auth.getSession();
        currentSession = data?.session || null;
      }

      const activeUser = currentSession?.user || null;
      financeService.setCachedUserId(activeUser?.id || null);

      // Instant Local Cache Preview (0ms delay)
      let hasCachedData = false;
      if (activeUser?.id) {
        const cachedTxs = financeService.getLocalTransactions(activeUser.id);
        const cachedBudgets = financeService.getLocalBudgets(activeUser.id);
        const cachedGoals = financeService.getLocalGoals(activeUser.id);

        if (cachedTxs.length > 0 || cachedBudgets.length > 0 || cachedGoals.length > 0) {
          hasCachedData = true;
          setSession(currentSession);
          setUser({
            name:
              activeUser.user_metadata?.full_name ||
              (activeUser.email ? activeUser.email.split("@")[0] : "Pengguna"),
            email: activeUser.email,
            avatar:
              activeUser.user_metadata?.avatar_url ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                activeUser.email
              )}&backgroundColor=0f766e,0d9488&textColor=ffffff`,
            role: "Pengguna Finora",
          });
          setTransactions(cachedTxs);
          setBudgets(cachedBudgets);
          setGoals(cachedGoals);
          setStats(financeService.computeStats(cachedTxs));
          setCashFlow(financeService.computeCashFlow(cachedTxs));
          setCategoryExpenses(financeService.computeCategoryExpenses(cachedTxs));
          setFinancialHealth(financeService.computeFinancialHealth(cachedTxs));
          setLoading(false); // Instantly dismiss loading spinner
        }
      }

      if (!hasCachedData) {
        setLoading(true);
      }

      // Background Cloud Revalidation from Supabase
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
    let isMounted = true;

    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) return;
        if (data?.session) {
          setSession({ ...data.session });
          financeService.setCachedUserId(data.session.user.id);
          loadData(data.session);
        } else {
          // Do not wipe session if user has just logged in
          setSession((prev) => prev || null);
        }
        setAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (!isMounted) return;
        setAuthLoading(false);

        if (event === "SIGNED_OUT") {
          financeService.handleSignOut();
          setSession(null);
          setUser(null);
          loadData(null);
        } else if (currentSession) {
          setSession({ ...currentSession });
          financeService.setCachedUserId(currentSession.user.id);
          loadData(currentSession);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      setAuthLoading(false);
      loadData(null);
    }
  }, [loadData]);

  // Realtime Supabase Database Sync across multiple devices (Laptop <-> HP)
  useEffect(() => {
    const activeUserId = session?.user?.id;
    if (!activeUserId || !isSupabaseConfigured()) return;

    const channelName = `realtime-user-sync-${activeUserId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${activeUserId}`,
        },
        () => {
          loadData(session);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "budgets",
          filter: `user_id=eq.${activeUserId}`,
        },
        () => {
          loadData(session);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "savings_goals",
          filter: `user_id=eq.${activeUserId}`,
        },
        () => {
          loadData(session);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, session, loadData]);

  // Auto-sync revalidation when user switches tab or unlocks device
  useEffect(() => {
    if (!session) return;

    const handleSyncOnFocus = () => {
      if (document.visibilityState === "visible") {
        loadData(session);
      }
    };

    window.addEventListener("focus", handleSyncOnFocus);
    document.addEventListener("visibilitychange", handleSyncOnFocus);

    return () => {
      window.removeEventListener("focus", handleSyncOnFocus);
      document.removeEventListener("visibilitychange", handleSyncOnFocus);
    };
  }, [session, loadData]);

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
    const cleanName = (fullName || "").trim() || "Pengguna";

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName },
      },
    });
    if (error) throw error;

    let activeSession = data?.session || null;

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
      financeService.setCachedUserId(activeSession.user.id);
      const resolvedAvatar =
        activeSession.user?.user_metadata?.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}&backgroundColor=0f766e,0d9488&textColor=ffffff`;

      setUser({
        name: cleanName,
        email: cleanEmail,
        avatar: resolvedAvatar,
        role: "Pengguna Finora",
        plan: "Supabase Cloud",
      });
      setSession({ ...activeSession });
      setAuthLoading(false);
      financeService.updateProfile({ fullName: cleanName }).catch(() => {});
      loadData(activeSession);
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
      financeService.setCachedUserId(data.session.user.id);

      const resolvedName =
        data.user?.user_metadata?.full_name ||
        (data.user?.email ? data.user.email.split("@")[0] : "Pengguna");
      const resolvedAvatar =
        data.user?.user_metadata?.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          data.user?.email || "Pengguna"
        )}&backgroundColor=0f766e,0d9488&textColor=ffffff`;

      setUser({
        name: resolvedName,
        email: data.user?.email,
        avatar: resolvedAvatar,
        role: "Pengguna Finora",
        plan: "Supabase Cloud",
      });

      // Instantly activate session with fresh object copy to trigger immediate re-render
      setSession({ ...data.session });
      setAuthLoading(false);
    }

    if (data?.user) {
      const nameToSave =
        data.user.user_metadata?.full_name ||
        (data.user.email ? data.user.email.split("@")[0] : "Pengguna");
      financeService.updateProfile({ fullName: nameToSave }).catch(() => {});
    }

    // Instant non-blocking trigger so login responds in milliseconds
    loadData(data?.session);
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
      loadData(null);
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
  // TRANSACTION CRUD (Ultra-fast Optimistic Updates)
  // ==========================================
  const addTransaction = async (txData) => {
    const tempId = `tx-${Date.now()}`;
    const optimisticItem = {
      id: tempId,
      title: txData.title,
      amount: Number(txData.amount),
      type: txData.type || "expense",
      category: txData.category || "Lainnya",
      date: txData.date || new Date().toISOString().split("T")[0],
      paymentMethod: txData.paymentMethod || "Transfer",
      note: txData.note || "",
      synced: false,
    };

    // 1. Instant 0ms UI update
    setTransactions((prev) => {
      const updated = [optimisticItem, ...prev];
      setStats(financeService.computeStats(updated));
      setCashFlow(financeService.computeCashFlow(updated));
      setCategoryExpenses(financeService.computeCategoryExpenses(updated));
      setFinancialHealth(financeService.computeFinancialHealth(updated));
      return updated;
    });

    // 2. Instant notification
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

    // 3. Background Cloud Sync (reconcile real Supabase ID)
    financeService
      .addTransaction(txData)
      .then((confirmed) => {
        setTransactions((prev) => {
          const reconciled = prev.map((t) => (t.id === tempId ? confirmed : t));
          setStats(financeService.computeStats(reconciled));
          setCashFlow(financeService.computeCashFlow(reconciled));
          setCategoryExpenses(financeService.computeCategoryExpenses(reconciled));
          setFinancialHealth(financeService.computeFinancialHealth(reconciled));
          return reconciled;
        });
      })
      .catch((err) => {
        console.error("Background sync transaction error:", err);
        // Rollback optimistic update if server rejected it
        setTransactions((prev) => {
          const rolledBack = prev.filter((t) => t.id !== tempId);
          setStats(financeService.computeStats(rolledBack));
          setCashFlow(financeService.computeCashFlow(rolledBack));
          setCategoryExpenses(financeService.computeCategoryExpenses(rolledBack));
          setFinancialHealth(financeService.computeFinancialHealth(rolledBack));
          return rolledBack;
        });
        setNotifications((prev) => [
          {
            id: Date.now(),
            title: "Gagal Menyimpan ke Cloud",
            message: err.message || "Transaksi gagal disimpan ke database Supabase.",
            type: "error",
            time: "Baru saja",
            read: false,
          },
          ...prev,
        ]);
      });

    return optimisticItem;
  };

  const deleteTransaction = async (id) => {
    // Instant 0ms Optimistic Delete
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      setStats(financeService.computeStats(updated));
      setCashFlow(financeService.computeCashFlow(updated));
      setCategoryExpenses(financeService.computeCategoryExpenses(updated));
      setFinancialHealth(financeService.computeFinancialHealth(updated));
      return updated;
    });

    // Background Cloud Delete
    financeService.deleteTransaction(id).catch(console.error);
  };

  const addGoal = async (goalData) => {
    const tempId = `g-${Date.now()}`;
    const optimistic = {
      id: tempId,
      name: goalData.name,
      title: goalData.name,
      current: Number(goalData.current || 0),
      target: Number(goalData.target),
      percentage: Math.min(100, Math.round(((goalData.current || 0) / goalData.target) * 100)),
      date: goalData.date || "2026-12-31",
      color: goalData.color || "teal",
      synced: false,
    };

    // Instant 0ms UI Update
    setGoals((prev) => [...prev, optimistic]);

    // Background Cloud Sync
    financeService
      .addGoal(goalData)
      .then((confirmed) => {
        setGoals((prev) => prev.map((g) => (g.id === tempId ? confirmed : g)));
      })
      .catch(console.error);

    return optimistic;
  };

  const depositToGoal = async (goalId, amount) => {
    // Instant 0ms Goal Deposit UI Update
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = Number(g.current || 0) + Number(amount);
          const target = Number(g.target || 1);
          return {
            ...g,
            current: newCurrent,
            percentage: Math.min(100, Math.round((newCurrent / target) * 100)),
          };
        }
        return g;
      })
    );

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#5EEAD4", "#60A5FA", "#34D399"],
      });
    } catch {}

    financeService.updateGoalDeposit(goalId, amount).catch(console.error);
  };

  const addBudget = async (budgetData) => {
    const tempId = `b-${Date.now()}`;
    const optimistic = {
      id: tempId,
      category: budgetData.category,
      spent: Number(budgetData.spent || 0),
      limit: Number(budgetData.limit),
      percentage: Math.round(((budgetData.spent || 0) / budgetData.limit) * 100),
      isExceeded: (budgetData.spent || 0) > budgetData.limit,
      synced: false,
    };

    // Instant 0ms UI Update
    setBudgets((prev) => [...prev, optimistic]);

    // Background Cloud Sync
    financeService
      .addBudget(budgetData)
      .then((confirmed) => {
        setBudgets((prev) => prev.map((b) => (b.id === tempId ? confirmed : b)));
      })
      .catch(console.error);

    return optimistic;
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
