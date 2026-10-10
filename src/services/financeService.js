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
    return userId ? `finora_user_tx_${userId}` : null;
  }

  getBudgetsStorageKey(userId) {
    return userId ? `finora_user_budgets_${userId}` : null;
  }

  getGoalsStorageKey(userId) {
    return userId ? `finora_user_goals_${userId}` : null;
  }

  getLocalTransactions(userId) {
    if (!userId) return [];
    try {
      const primaryKey = this.getTxStorageKey(userId);
      if (!primaryKey) return [];
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  saveLocalTransactions(userId, list) {
    if (!userId) return;
    try {
      const key = this.getTxStorageKey(userId);
      if (key) {
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch {}
  }

  getLocalBudgets(userId) {
    if (!userId) return [];
    try {
      const primaryKey = this.getBudgetsStorageKey(userId);
      if (!primaryKey) return [];
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  saveLocalBudgets(userId, list) {
    if (!userId) return;
    try {
      const key = this.getBudgetsStorageKey(userId);
      if (key) {
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch {}
  }

  getLocalGoals(userId) {
    if (!userId) return [];
    try {
      const primaryKey = this.getGoalsStorageKey(userId);
      if (!primaryKey) return [];
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  saveLocalGoals(userId, list) {
    if (!userId) return;
    try {
      const key = this.getGoalsStorageKey(userId);
      if (key) {
        localStorage.setItem(key, JSON.stringify(list));
      }
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
    const localList = this.getLocalTransactions(userId);

    if (userId) {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*, categories(name, color, icon)")
          .eq("user_id", userId)
          .order("occurred_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          const remoteList = data.map((t) => ({
            id: t.id,
            title: t.description,
            amount: Number(t.amount),
            type: t.type,
            category: t.categories?.name || t.category_id || "Lainnya",
            date: t.occurred_at ? t.occurred_at.split("T")[0] : new Date().toISOString().split("T")[0],
            paymentMethod: t.payment_method || "Transfer",
            note: t.note || "",
            accountId: t.account_id,
            categoryId: t.category_id,
            synced: true,
          }));

          remoteList.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          this.saveLocalTransactions(userId, remoteList);
          return remoteList;
        } else if (localList.length > 0) {
          return localList;
        }
      } catch (err) {
        console.warn("Supabase getTransactions failed:", err);
        if (localList.length > 0) return localList;
      }
    }

    return localList;
  }

  async addTransaction(newTx) {
    const userId = await this.getAuthUserId();
    if (!userId) {
      throw new Error("Sesi login Anda tidak aktif. Silakan masuk kembali.");
    }

    let categoryId = null;
    if (newTx.category) {
      try {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .ilike("name", newTx.category)
          .limit(1)
          .maybeSingle();
        if (cat?.id) categoryId = cat.id;
      } catch {}
    }

    let dateIso;
    try {
      dateIso = newTx.date ? new Date(newTx.date).toISOString() : new Date().toISOString();
    } catch {
      dateIso = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: userId,
          description: newTx.title,
          amount: Number(newTx.amount),
          type: newTx.type || "expense",
          category_id: categoryId,
          occurred_at: dateIso,
          payment_method: newTx.paymentMethod || "Transfer",
          note: newTx.note || "",
        },
      ])
      .select("*, categories(name, color, icon)")
      .single();

    if (error) {
      console.error("Gagal menyimpan transaksi ke Supabase:", error);
      throw new Error("Gagal menyimpan ke server: " + (error.message || "Periksa koneksi Anda"));
    }

    const confirmedItem = {
      id: data.id,
      title: data.description,
      amount: Number(data.amount),
      type: data.type,
      category: data.categories?.name || newTx.category || "Lainnya",
      date: data.occurred_at ? data.occurred_at.split("T")[0] : new Date().toISOString().split("T")[0],
      paymentMethod: data.payment_method || "Transfer",
      note: data.note || "",
      accountId: data.account_id,
      categoryId: data.category_id,
      synced: true,
    };

    const currentLocals = this.getLocalTransactions(userId);
    const updatedLocals = [confirmedItem, ...currentLocals.filter((x) => x.id !== data.id)];
    this.saveLocalTransactions(userId, updatedLocals);

    return confirmedItem;
  }

  async syncUnsyncedTransactions(userId, unsyncedList) {
    if (!userId || !unsyncedList?.length) return;
    for (const tx of unsyncedList) {
      try {
        let categoryId = tx.categoryId || null;
        if (!categoryId && tx.category) {
          const { data: cat } = await supabase
            .from("categories")
            .select("id")
            .ilike("name", tx.category)
            .limit(1)
            .maybeSingle();
          if (cat) categoryId = cat.id;
        }

        let dateIso;
        try {
          dateIso = tx.date ? new Date(tx.date).toISOString() : new Date().toISOString();
        } catch {
          dateIso = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from("transactions")
          .insert([
            {
              user_id: userId,
              description: tx.title,
              amount: Number(tx.amount),
              type: tx.type || "expense",
              category_id: categoryId,
              occurred_at: dateIso,
              payment_method: tx.paymentMethod || "Transfer",
              note: tx.note || "",
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const current = this.getLocalTransactions(userId);
          const updated = current.map((item) =>
            item.id === tx.id ? { ...item, id: data.id, synced: true } : item
          );
          this.saveLocalTransactions(userId, updated);
        }
      } catch (e) {
        console.warn("Auto-sync transaction notice:", e);
      }
    }
  }

  async deleteTransaction(txId) {
    const userId = await this.getAuthUserId();

    const currentLocals = this.getLocalTransactions(userId);
    const updatedLocals = currentLocals.filter((t) => t.id !== txId);
    this.saveLocalTransactions(userId, updatedLocals);

    if (userId && !String(txId).startsWith("tx-")) {
      try {
        await supabase
          .from("transactions")
          .delete()
          .eq("id", txId)
          .eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase deleteTransaction notice:", err);
      }
    }

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

    if (userId) {
      try {
        const { data, error } = await supabase
          .from("budgets")
          .select("*")
          .eq("user_id", userId);

        if (!error && Array.isArray(data)) {
          const remoteList = data.map((b) => {
            const spent = txs
              .filter((t) => t.type === "expense" && t.category === b.category_name)
              .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const limit = Number(b.amount_limit);
            const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            return {
              id: b.id,
              category: b.category_name,
              spent,
              limit,
              percentage,
              isExceeded: spent > limit,
              synced: true,
            };
          });

          this.saveLocalBudgets(userId, remoteList);
          return remoteList;
        } else if (localBudgets.length > 0) {
          return localBudgets;
        }
      } catch (err) {
        if (localBudgets.length > 0) return localBudgets;
      }
    }

    return localBudgets.map((b) => {
      const spent = txs
        .filter((t) => t.type === "expense" && t.category === b.category)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const limit = Number(b.limit);
      return {
        ...b,
        spent,
        percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
        isExceeded: spent > limit,
      };
    });
  }

  async addBudget(newBudget) {
    const userId = await this.getAuthUserId();
    const tempId = `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const budgetItem = {
      id: tempId,
      category: newBudget.category,
      spent: Number(newBudget.spent || 0),
      limit: Number(newBudget.limit),
      percentage: Math.round(((newBudget.spent || 0) / newBudget.limit) * 100),
      isExceeded: (newBudget.spent || 0) > newBudget.limit,
      synced: false,
    };

    const currentLocals = this.getLocalBudgets(userId);
    const updatedLocals = [...currentLocals, budgetItem];
    this.saveLocalBudgets(userId, updatedLocals);

    if (userId) {
      try {
        const { data, error } = await supabase
          .from("budgets")
          .insert([
            {
              user_id: userId,
              category_name: newBudget.category,
              amount_limit: Number(newBudget.limit),
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const confirmed = {
            ...budgetItem,
            id: data.id,
            synced: true,
          };
          const reconciled = updatedLocals.map((x) => (x.id === tempId ? confirmed : x));
          this.saveLocalBudgets(userId, reconciled);
          return confirmed;
        }
      } catch (err) {
        console.warn("Supabase addBudget notice:", err);
      }
    }

    return budgetItem;
  }

  // ==========================================
  // SAVINGS GOALS (CRUD)
  // ==========================================
  async getGoals(explicitUserId = null) {
    const userId = explicitUserId || (await this.getAuthUserId());
    const localGoals = this.getLocalGoals(userId);

    if (userId) {
      try {
        const { data, error } = await supabase
          .from("savings_goals")
          .select("*")
          .eq("user_id", userId);

        if (!error && Array.isArray(data)) {
          const remoteList = data.map((g) => {
            const current = Number(g.current_amount || 0);
            const target = Number(g.target_amount);
            return {
              id: g.id,
              name: g.name,
              title: g.name,
              current,
              target,
              percentage: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
              date: g.target_date || "2026-12-31",
              color: g.color || "teal",
              synced: true,
            };
          });

          this.saveLocalGoals(userId, remoteList);
          return remoteList;
        } else if (localGoals.length > 0) {
          return localGoals;
        }
      } catch (err) {
        if (localGoals.length > 0) return localGoals;
      }
    }

    return localGoals;
  }

  async addGoal(newGoal) {
    const userId = await this.getAuthUserId();
    const tempId = `g-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const goalItem = {
      id: tempId,
      name: newGoal.name,
      title: newGoal.name,
      current: Number(newGoal.current || 0),
      target: Number(newGoal.target),
      percentage: Math.min(100, Math.round(((newGoal.current || 0) / newGoal.target) * 100)),
      date: newGoal.date || "2026-12-31",
      color: newGoal.color || "teal",
      synced: false,
    };

    const currentLocals = this.getLocalGoals(userId);
    const updatedLocals = [...currentLocals, goalItem];
    this.saveLocalGoals(userId, updatedLocals);

    if (userId) {
      try {
        const { data, error } = await supabase
          .from("savings_goals")
          .insert([
            {
              user_id: userId,
              name: newGoal.name,
              target_amount: Number(newGoal.target),
              current_amount: Number(newGoal.current || 0),
              target_date: newGoal.date || null,
              color: newGoal.color || "teal",
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const confirmed = {
            ...goalItem,
            id: data.id,
            synced: true,
          };
          const reconciled = updatedLocals.map((x) => (x.id === tempId ? confirmed : x));
          this.saveLocalGoals(userId, reconciled);
          return confirmed;
        }
      } catch (err) {
        console.warn("Supabase addGoal notice:", err);
      }
    }

    return goalItem;
  }

  async updateGoalDeposit(goalId, amountToAdd) {
    const userId = await this.getAuthUserId();

    const currentLocals = this.getLocalGoals(userId);
    const updatedLocals = currentLocals.map((g) => {
      if (g.id === goalId) {
        const newCurrent = Number(g.current || 0) + Number(amountToAdd);
        const target = Number(g.target || 1);
        return {
          ...g,
          current: newCurrent,
          percentage: Math.min(100, Math.round((newCurrent / target) * 100)),
        };
      }
      return g;
    });
    this.saveLocalGoals(userId, updatedLocals);

    if (userId && !String(goalId).startsWith("g-")) {
      try {
        const targetGoal = currentLocals.find((g) => g.id === goalId);
        if (targetGoal) {
          const newCurrent = Number(targetGoal.current || 0) + Number(amountToAdd);
          await supabase
            .from("savings_goals")
            .update({ current_amount: newCurrent, updated_at: new Date().toISOString() })
            .eq("id", goalId)
            .eq("user_id", userId);
        }
      } catch (err) {
        console.warn("Supabase updateGoalDeposit notice:", err);
      }
    }

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
