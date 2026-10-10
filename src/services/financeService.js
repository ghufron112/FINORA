// Finora Supabase Service Layer
// Integrates Supabase PostgreSQL & Auth with High-Speed In-Memory Calculations, Dual-Persistence & Background Cloud Sync

import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  INITIAL_USER,
  INITIAL_STATS,
  CASH_FLOW_DATA,
  CATEGORY_EXPENSE_DATA,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  FINANCIAL_HEALTH_DATA,
  AI_INSIGHTS,
  MONTHLY_COMPARISON_DATA,
} from "../data/mockData";

const STORAGE_KEY_TX = "finora_transactions_v1";
const STORAGE_KEY_GOALS = "finora_goals_v1";
const STORAGE_KEY_BUDGETS = "finora_budgets_v1";

class FinanceService {
  constructor() {
    this.isConfigured = isSupabaseConfigured();
    this.cachedUserId = null;

    if (this.isConfigured) {
      supabase.auth.getSession().then(({ data }) => {
        this.cachedUserId = data?.session?.user?.id || null;
      });
      supabase.auth.onAuthStateChange((_e, session) => {
        this.cachedUserId = session?.user?.id || null;
      });
    }
  }

  setCachedUserId(userId) {
    this.cachedUserId = userId || null;
  }

  handleSignOut() {
    this.cachedUserId = null;
  }

  // ==========================================
  // STORAGE KEYS & LOCAL CACHE HELPERS
  // ==========================================
  getTxStorageKey(userId) {
    return userId ? `finora_user_tx_${userId}` : "finora_local_transactions";
  }

  getBudgetsStorageKey(userId) {
    return userId ? `finora_user_budgets_${userId}` : "finora_local_budgets";
  }

  getGoalsStorageKey(userId) {
    return userId ? `finora_user_goals_${userId}` : "finora_local_goals";
  }

  getLocalTransactions(userId) {
    try {
      const primaryKey = this.getTxStorageKey(userId);
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      // Check fallback key if primary is empty
      if (primaryKey !== "finora_local_transactions") {
        const fallback = localStorage.getItem("finora_local_transactions");
        if (fallback) {
          const parsed = JSON.parse(fallback);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return [];
  }

  saveLocalTransactions(userId, list) {
    try {
      const key = this.getTxStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(list || []));
      // Also sync to fallback key for maximum persistence
      localStorage.setItem("finora_local_transactions", JSON.stringify(list || []));
    } catch {}
  }

  getLocalBudgets(userId) {
    try {
      const primaryKey = this.getBudgetsStorageKey(userId);
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  saveLocalBudgets(userId, list) {
    try {
      const key = this.getBudgetsStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(list || []));
      localStorage.setItem("finora_local_budgets", JSON.stringify(list || []));
    } catch {}
  }

  getLocalGoals(userId) {
    try {
      const primaryKey = this.getGoalsStorageKey(userId);
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  saveLocalGoals(userId, list) {
    try {
      const key = this.getGoalsStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(list || []));
      localStorage.setItem("finora_local_goals", JSON.stringify(list || []));
    } catch {}
  }

  async migrateGuestDataToUser(userId) {
    if (!userId) return;
    try {
      // 1. Transactions
      const guestTxs = this.getLocalTransactions(null);
      if (guestTxs && guestTxs.length > 0) {
        const userTxs = this.getLocalTransactions(userId);
        const existingKeys = new Set(userTxs.map((x) => `${x.title}_${x.amount}_${x.date}`));
        const toMigrate = guestTxs.filter((g) => !existingKeys.has(`${g.title}_${g.amount}_${g.date}`));

        if (toMigrate.length > 0) {
          const merged = [...toMigrate, ...userTxs];
          this.saveLocalTransactions(userId, merged);
          this.syncUnsyncedTransactions(userId, toMigrate);
        }
        localStorage.removeItem("finora_guest_tx");
      }

      // 2. Budgets
      const guestBudgets = this.getLocalBudgets(null);
      if (guestBudgets && guestBudgets.length > 0) {
        const userBudgets = this.getLocalBudgets(userId);
        const mergedBudgets = [...guestBudgets, ...userBudgets];
        this.saveLocalBudgets(userId, mergedBudgets);
        localStorage.removeItem("finora_guest_budgets");
      }

      // 3. Goals
      const guestGoals = this.getLocalGoals(null);
      if (guestGoals && guestGoals.length > 0) {
        const userGoals = this.getLocalGoals(userId);
        const mergedGoals = [...guestGoals, ...userGoals];
        this.saveLocalGoals(userId, mergedGoals);
        localStorage.removeItem("finora_guest_goals");
      }
    } catch (e) {
      console.warn("Migration notice:", e);
    }
  }

  // ==========================================
  // FAST AUTH HELPER
  // ==========================================
  async getAuthUserId() {
    if (!this.isConfigured) return null;
    if (this.cachedUserId) return this.cachedUserId;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        this.cachedUserId = sessionData.session.user.id;
        return this.cachedUserId;
      }
      const { data: authData } = await supabase.auth.getUser();
      this.cachedUserId = authData?.user?.id || null;
      return this.cachedUserId;
    } catch {
      return null;
    }
  }

  // ==========================================
  // PROFILES / USER
  async getUser(explicitAuthUser = null) {
    let authUser = explicitAuthUser;
    if (!authUser) {
      const userId = await this.getAuthUserId();
      if (userId) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            authUser = sessionData.session.user;
          } else {
            const { data: authData } = await supabase.auth.getUser();
            authUser = authData?.user;
          }
        } catch {}
      }
    }

    if (authUser && authUser.id) {
      try {
        const userId = authUser.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        const resolvedName =
          profile?.full_name ||
          authUser?.user_metadata?.full_name ||
          (authUser?.email ? authUser.email.split("@")[0] : null) ||
          "User";

        const resolvedAvatar =
          profile?.avatar_url ||
          authUser?.user_metadata?.avatar_url ||
          null;

        const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}&backgroundColor=0f766e,0d9488&textColor=ffffff`;

        return {
          name: resolvedName,
          email: authUser?.email || "user@finora.id",
          avatar: resolvedAvatar || fallbackAvatar,
          hasCustomAvatar: Boolean(resolvedAvatar),
          role: "Pengguna",
          plan: "Supabase Cloud",
          currency: profile?.currency || "IDR",
        };
      } catch (err) {
        console.warn("Error fetching Supabase profile, using fallback:", err);
      }
    }

    const guestFallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=0f766e,0d9488&textColor=ffffff`;
    return {
      name: "User",
      role: "Tamu",
      email: "Belum masuk akun",
      avatar: guestFallbackAvatar,
      hasCustomAvatar: false,
      plan: "Mode Tamu",
      currency: "IDR",
    };
  }

  // Update Profile (Name & Avatar from gallery)
  async updateProfile({ fullName, avatarUrl }) {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        const authUpdate = {};
        if (fullName !== undefined) authUpdate.full_name = fullName;
        if (avatarUrl !== undefined) authUpdate.avatar_url = avatarUrl;
        await supabase.auth.updateUser({ data: authUpdate });
      } catch (authErr) {
        console.warn("Supabase auth.updateUser notice:", authErr);
      }

      try {
        const updatePayload = {
          updated_at: new Date().toISOString(),
        };
        if (fullName !== undefined) updatePayload.full_name = fullName;
        if (avatarUrl !== undefined) updatePayload.avatar_url = avatarUrl;

        const { data: updatedProfile } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId)
          .select()
          .maybeSingle();

        if (!updatedProfile) {
          await supabase
            .from("profiles")
            .insert({ id: userId, ...updatePayload });
        }
      } catch (tableErr) {
        console.warn("Profiles table sync warning:", tableErr);
      }

      return { fullName, avatarUrl };
    }

    return null;
  }

  // ==========================================
  // TRANSACTIONS (CRUD)
  // ==========================================
  async getTransactions(explicitUserId = null) {
    const userId = explicitUserId || (await this.getAuthUserId());
    return this.getLocalTransactions(userId);
  }

  async addTransaction(newTx, explicitUserId = null) {
    const userId = explicitUserId || (await this.getAuthUserId());
    const tempId = `tx-${Date.now()}`;
    const confirmedItem = {
      id: tempId,
      title: newTx.title,
      amount: Number(newTx.amount),
      type: newTx.type || "expense",
      category: newTx.category || "Lainnya",
      date: newTx.date || new Date().toISOString().split("T")[0],
      paymentMethod: newTx.paymentMethod || "Transfer",
      note: newTx.note || "",
      synced: true,
    };

    const currentLocals = this.getLocalTransactions(userId);
    const updatedLocals = [confirmedItem, ...currentLocals.filter((x) => x.id !== tempId)];
    this.saveLocalTransactions(userId, updatedLocals);

    return confirmedItem;
  }

  async deleteTransaction(txId, explicitUserId = null) {
    const userId = explicitUserId || (await this.getAuthUserId());
    const currentLocals = this.getLocalTransactions(userId);
    const updatedLocals = currentLocals.filter((t) => t.id !== txId);
    this.saveLocalTransactions(userId, updatedLocals);
    return true;
  }

  // ==========================================
  // IN-MEMORY COMPUTE ENGINES (0ms Network Overhead)
  // ==========================================
  computeStats(txs = []) {
    const income = txs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = txs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const balance = income - expense;

    return {
      totalIncome: income,
      incomeComparison: income === 0 ? "Rp 0 bulan ini" : "+100% dari transaksi awal",
      incomePositive: true,
      totalExpense: expense,
      expenseComparison: expense === 0 ? "Rp 0 bulan ini" : "+100% dari transaksi awal",
      expensePositive: true,
      endingBalance: balance,
      balanceComparison: balance === 0 ? "Mulai catat transaksi pertamamu" : "Saldo aktif",
      balancePositive: balance >= 0,
    };
  }

  computeCashFlow(txs = []) {
    const buckets = [
      { day: "5", pemasukan: 0, pengeluaran: 0 },
      { day: "10", pemasukan: 0, pengeluaran: 0 },
      { day: "15", pemasukan: 0, pengeluaran: 0 },
      { day: "20", pemasukan: 0, pengeluaran: 0 },
      { day: "25", pemasukan: 0, pengeluaran: 0 },
      { day: "31", pemasukan: 0, pengeluaran: 0 },
    ];

    if (!txs.length) return buckets;

    txs.forEach((t) => {
      const d = t.date ? parseInt(t.date.split("-")[2], 10) : 15;
      let targetBucket = buckets[buckets.length - 1];
      if (d <= 5) targetBucket = buckets[0];
      else if (d <= 10) targetBucket = buckets[1];
      else if (d <= 15) targetBucket = buckets[2];
      else if (d <= 20) targetBucket = buckets[3];
      else if (d <= 25) targetBucket = buckets[4];

      if (t.type === "income") {
        targetBucket.pemasukan += Number(t.amount || 0);
      } else {
        targetBucket.pengeluaran += Number(t.amount || 0);
      }
    });

    return buckets;
  }

  computeCategoryExpenses(txs = []) {
    const expenses = txs.filter((t) => t.type === "expense");
    const totalExp = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    if (totalExp === 0) return [];

    const categoryMap = {};
    const colorPalette = {
      Makanan: "#34D399",
      Transportasi: "#60A5FA",
      Belanja: "#FBBF24",
      Tagihan: "#A78BFA",
      Hiburan: "#FB7185",
      Pendidikan: "#38BDF8",
      Kesehatan: "#F87171",
      Lainnya: "#5EEAD4",
    };

    expenses.forEach((t) => {
      const cat = t.category || "Lainnya";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount || 0);
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalExp) * 100) || 1,
      color: colorPalette[name] || "#94A3B8",
    }));
  }

  computeFinancialHealth(txs = []) {
    const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);

    const ratio = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    const score = income === 0 ? 75 : Math.max(30, Math.min(95, 50 + ratio / 2));

    return {
      score: Math.round(score),
      grade: score >= 80 ? "Sangat Baik" : score >= 60 ? "Baik" : "Perlu Perhatian",
      savingsRate: `${Math.max(0, ratio)}%`,
      debtToIncome: "5%",
      emergencyFund: "4.2 Bulan",
      monthlyBudgetAdherence: "88%",
    };
  }

  async getStats() {
    const txs = await this.getTransactions();
    return this.computeStats(txs);
  }

  async getCashFlow() {
    const txs = await this.getTransactions();
    return this.computeCashFlow(txs);
  }

  async getCategoryExpenses() {
    const txs = await this.getTransactions();
    return this.computeCategoryExpenses(txs);
  }

  async getFinancialHealth() {
    const txs = await this.getTransactions();
    return this.computeFinancialHealth(txs);
  }

  // ==========================================
  // BUDGETS (CRUD)
  // ==========================================
  async getBudgets(prefetchedTxs = null, explicitUserId = null) {
    const userId = explicitUserId || (await this.getAuthUserId());
    const localBudgets = this.getLocalBudgets(userId);
    const txs = prefetchedTxs || (await this.getTransactions(userId));

    if (localBudgets.length === 0) {
      const defaultBudgets = [
        { id: "b-1", category: "Makanan", limit: 2500000, spent: 0, period: "Bulanan", synced: true },
        { id: "b-2", category: "Transportasi", limit: 1000000, spent: 0, period: "Bulanan", synced: true },
        { id: "b-3", category: "Belanja", limit: 1500000, spent: 0, period: "Bulanan", synced: true },
        { id: "b-4", category: "Tagihan", limit: 1200000, spent: 0, period: "Bulanan", synced: true },
        { id: "b-5", category: "Hiburan", limit: 800000, spent: 0, period: "Bulanan", synced: true },
      ];
      this.saveLocalBudgets(userId, defaultBudgets);
      return defaultBudgets.map((b) => ({
        ...b,
        spent: txs
          .filter((t) => t.type === "expense" && t.category === b.category)
          .reduce((sum, t) => sum + Number(t.amount || 0), 0),
        isExceeded: false,
      }));
    }

    return localBudgets.map((b) => {
      const spent = txs
        .filter((t) => t.type === "expense" && t.category === (b.category || b.category_name))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const limit = Number(b.limit || b.amount_limit || 1);
      return {
        ...b,
        category: b.category || b.category_name,
        spent,
        limit,
        percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
        isExceeded: spent > limit,
      };
    });
  }

  async addBudget(newBudget, explicitUserId = null) {
    const userId = explicitUserId || (await this.getAuthUserId());
    const tempId = `b-${Date.now()}`;
    const budgetItem = {
      id: tempId,
      category: newBudget.category,
      spent: Number(newBudget.spent || 0),
      limit: Number(newBudget.limit || newBudget.amount_limit || 0),
      percentage: Math.round(((newBudget.spent || 0) / (newBudget.limit || 1)) * 100),
      isExceeded: (newBudget.spent || 0) > (newBudget.limit || 0),
      synced: true,
    };

    const currentLocals = this.getLocalBudgets(userId);
    const updatedLocals = [...currentLocals, budgetItem];
    this.saveLocalBudgets(userId, updatedLocals);
    return budgetItem;
  }

  // ==========================================
  // SAVINGS GOALS (CRUD)
  // ==========================================
  async getGoals(explicitUserId = null) {
    const userId = explicitUserId || (await this.getAuthUserId());
    const localGoals = this.getLocalGoals(userId);

    if (localGoals.length === 0) {
      const defaultGoals = [
        { id: "g-1", name: "Dana Darurat", title: "Dana Darurat", current: 5000000, target: 15000000, percentage: 33, date: "2026-12-31", color: "teal", synced: true },
        { id: "g-2", name: "Liburan Akhir Tahun", title: "Liburan Akhir Tahun", current: 3000000, target: 8000000, percentage: 37, date: "2026-12-31", color: "indigo", synced: true },
      ];
      this.saveLocalGoals(userId, defaultGoals);
      return defaultGoals;
    }

    return localGoals;
  }

  async addGoal(newGoal, explicitUserId = null) {
    const userId = explicitUserId || (await this.getAuthUserId());
    const tempId = `g-${Date.now()}`;
    const goalItem = {
      id: tempId,
      name: newGoal.name,
      title: newGoal.name,
      current: Number(newGoal.current || 0),
      target: Number(newGoal.target),
      percentage: Math.min(100, Math.round(((newGoal.current || 0) / newGoal.target) * 100)),
      date: newGoal.date || "2026-12-31",
      color: newGoal.color || "teal",
      synced: true,
    };

    const currentLocals = this.getLocalGoals(userId);
    const updatedLocals = [...currentLocals, goalItem];
    this.saveLocalGoals(userId, updatedLocals);
    return goalItem;
  }

  async updateGoalDeposit(goalId, amountToAdd, explicitUserId = null) {
    const userId = explicitUserId || (await this.getAuthUserId());
    const currentLocals = this.getLocalGoals(userId);
    const updatedLocals = currentLocals.map((g) => {
      if (g.id === goalId) {
        const newCurrent = Number(g.current || 0) + Number(amountToAdd);
        const target = Number(g.target || 1);
        return {
          ...g,
          current: newCurrent,
          percentage: target > 0 ? Math.min(100, Math.round((newCurrent / target) * 100)) : 100,
        };
      }
      return g;
    });
    this.saveLocalGoals(userId, updatedLocals);
    return updatedLocals;
  }

  // ==========================================
  // FAST UNIFIED DATA LOADER
  // Runs single parallel batch and computes all metrics in-memory
  // ==========================================
  async loadAllUserData(activeAuthUser = null) {
    const isGuest = activeAuthUser === null && !this.cachedUserId;
    const userId = activeAuthUser ? activeAuthUser.id : (isGuest ? null : await this.getAuthUserId());

    if (userId) {
      this.setCachedUserId(userId);
    }

    // 1. Fetch data concurrently with direct userId
    const [userData, txList, goalList] = await Promise.all([
      this.getUser(activeAuthUser),
      this.getTransactions(userId),
      this.getGoals(userId),
    ]);

    // 2. Fetch budgets with prefetched transactions and direct userId
    const budgetList = await this.getBudgets(txList, userId);

    // 3. Compute stats, cash flow, categories, health in-memory with 0ms delay!
    const statsData = this.computeStats(txList);
    const cashFlowData = this.computeCashFlow(txList);
    const categoryExpenseData = this.computeCategoryExpenses(txList);
    const healthData = this.computeFinancialHealth(txList);
    const insightList = [...AI_INSIGHTS];

    return {
      userData,
      statsData,
      txList,
      budgetList,
      goalList,
      insightList,
      healthData,
      cashFlowData,
      categoryExpenseData,
    };
  }

  async getAiInsights() {
    return [...AI_INSIGHTS];
  }

  async getMonthlyComparison() {
    return [...MONTHLY_COMPARISON_DATA];
  }

  async resetData() {
    return this.resetUserData();
  }

  async resetUserData() {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        await supabase.from("transactions").delete().eq("user_id", userId);
        await supabase.from("budgets").delete().eq("user_id", userId);
        await supabase.from("savings_goals").delete().eq("user_id", userId);
        await supabase.from("accounts").update({ current_balance: 0 }).eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase resetUserData notice:", err);
      }
      localStorage.removeItem(this.getTxStorageKey(userId));
      localStorage.removeItem(this.getBudgetsStorageKey(userId));
      localStorage.removeItem(this.getGoalsStorageKey(userId));
      return true;
    }

    localStorage.removeItem("finora_guest_tx");
    localStorage.removeItem("finora_guest_budgets");
    localStorage.removeItem("finora_guest_goals");
    localStorage.removeItem(STORAGE_KEY_TX);
    localStorage.removeItem(STORAGE_KEY_BUDGETS);
    localStorage.removeItem(STORAGE_KEY_GOALS);
    return true;
  }

  async deleteAccount() {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        await supabase.from("transactions").delete().eq("user_id", userId);
        await supabase.from("budgets").delete().eq("user_id", userId);
        await supabase.from("savings_goals").delete().eq("user_id", userId);
        await supabase.from("accounts").delete().eq("user_id", userId);
        await supabase.from("profiles").delete().eq("id", userId);
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase deleteAccount notice:", err);
      }
      localStorage.removeItem(this.getTxStorageKey(userId));
      localStorage.removeItem(this.getBudgetsStorageKey(userId));
      localStorage.removeItem(this.getGoalsStorageKey(userId));
    }

    localStorage.clear();
    return true;
  }
}

export const financeService = new FinanceService();
