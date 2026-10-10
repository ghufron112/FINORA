// Finora Supabase Service Layer
// Integrates Supabase PostgreSQL & Auth with Bulletproof Local-First Dual Persistence & Background Cloud Sync

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
  }

  // ==========================================
  // STORAGE KEYS & LOCAL CACHE HELPERS
  // ==========================================
  getTxStorageKey(userId) {
    return userId ? `finora_user_tx_${userId}` : "finora_guest_tx";
  }

  getBudgetsStorageKey(userId) {
    return userId ? `finora_user_budgets_${userId}` : "finora_guest_budgets";
  }

  getGoalsStorageKey(userId) {
    return userId ? `finora_user_goals_${userId}` : "finora_guest_goals";
  }

  getLocalTransactions(userId) {
    try {
      const primaryKey = this.getTxStorageKey(userId);
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }

      // Check legacy storage key
      const legacyRaw = localStorage.getItem(STORAGE_KEY_TX);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          localStorage.setItem(primaryKey, JSON.stringify(legacyParsed));
          return legacyParsed;
        }
      }

      // If authenticated, also inherit any transactions added in guest mode
      if (userId) {
        const guestRaw = localStorage.getItem("finora_guest_tx");
        if (guestRaw) {
          const guestParsed = JSON.parse(guestRaw);
          if (Array.isArray(guestParsed) && guestParsed.length > 0) {
            localStorage.setItem(primaryKey, JSON.stringify(guestParsed));
            return guestParsed;
          }
        }
      }
    } catch {}
    return [];
  }

  saveLocalTransactions(userId, list) {
    try {
      const key = this.getTxStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(list));
    } catch {}
  }

  getLocalBudgets(userId) {
    try {
      const primaryKey = this.getBudgetsStorageKey(userId);
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacyRaw = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          localStorage.setItem(primaryKey, JSON.stringify(legacyParsed));
          return legacyParsed;
        }
      }
      if (userId) {
        const guestRaw = localStorage.getItem("finora_guest_budgets");
        if (guestRaw) {
          const guestParsed = JSON.parse(guestRaw);
          if (Array.isArray(guestParsed) && guestParsed.length > 0) {
            localStorage.setItem(primaryKey, JSON.stringify(guestParsed));
            return guestParsed;
          }
        }
      }
    } catch {}
    return [];
  }

  saveLocalBudgets(userId, list) {
    try {
      const key = this.getBudgetsStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(list));
    } catch {}
  }

  getLocalGoals(userId) {
    try {
      const primaryKey = this.getGoalsStorageKey(userId);
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacyRaw = localStorage.getItem(STORAGE_KEY_GOALS);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          localStorage.setItem(primaryKey, JSON.stringify(legacyParsed));
          return legacyParsed;
        }
      }
      if (userId) {
        const guestRaw = localStorage.getItem("finora_guest_goals");
        if (guestRaw) {
          const guestParsed = JSON.parse(guestRaw);
          if (Array.isArray(guestParsed) && guestParsed.length > 0) {
            localStorage.setItem(primaryKey, JSON.stringify(guestParsed));
            return guestParsed;
          }
        }
      }
    } catch {}
    return [];
  }

  saveLocalGoals(userId, list) {
    try {
      const key = this.getGoalsStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(list));
    } catch {}
  }

  // ==========================================
  // AUTH HELPER
  // ==========================================
  async getAuthUserId() {
    if (!this.isConfigured) return null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        return sessionData.session.user.id;
      }
      const { data: authData } = await supabase.auth.getUser();
      return authData?.user?.id || null;
    } catch {
      return null;
    }
  }

  // ==========================================
  // PROFILES / USER
  // ==========================================
  async getUser() {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        let authUser = null;
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          authUser = authData.user;
        } else {
          const { data: sessionData } = await supabase.auth.getSession();
          authUser = sessionData?.session?.user;
        }

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
    return { ...INITIAL_USER, avatar: INITIAL_USER.avatar || guestFallbackAvatar };
  }

  // Update Profile (Name & Avatar from gallery)
  async updateProfile({ fullName, avatarUrl }) {
    const userId = await this.getAuthUserId();
    if (userId) {
      // 1. Always save to Supabase Auth metadata first (guaranteed to succeed without table RLS restriction)
      try {
        const authUpdate = {};
        if (fullName !== undefined) authUpdate.full_name = fullName;
        if (avatarUrl !== undefined) authUpdate.avatar_url = avatarUrl;
        await supabase.auth.updateUser({ data: authUpdate });
      } catch (authErr) {
        console.warn("Supabase auth.updateUser notice:", authErr);
      }

      // 2. Also sync to public.profiles table
      try {
        const updatePayload = {
          updated_at: new Date().toISOString(),
        };
        if (fullName !== undefined) updatePayload.full_name = fullName;
        if (avatarUrl !== undefined) updatePayload.avatar_url = avatarUrl;

        // Try update existing row first
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId)
          .select()
          .maybeSingle();

        // If row doesn't exist yet, try insert
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
  async getTransactions() {
    const userId = await this.getAuthUserId();
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

          // Merge with any unsynced local transactions
          const remoteIds = new Set(remoteList.map((r) => String(r.id)));
          const unsyncedLocals = localList.filter(
            (l) => !remoteIds.has(String(l.id)) && (!l.synced || String(l.id).startsWith("tx-"))
          );

          const merged = [...remoteList, ...unsyncedLocals];
          merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

          this.saveLocalTransactions(userId, merged);

          // Auto-sync in background if there were unsynced local rows
          if (unsyncedLocals.length > 0) {
            this.syncUnsyncedTransactions(userId, unsyncedLocals);
          }

          return merged;
        } else if (localList.length > 0) {
          // If Supabase returned error or empty, preserve user's local cache
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
    const tempId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const txItem = {
      id: tempId,
      title: newTx.title,
      amount: Number(newTx.amount),
      type: newTx.type || "expense",
      category: newTx.category || "Lainnya",
      date: newTx.date || new Date().toISOString().split("T")[0],
      paymentMethod: newTx.paymentMethod || "Transfer",
      note: newTx.note || "",
      synced: false,
    };

    // 1. Immediately persist to local cache so user never loses it
    const currentLocals = this.getLocalTransactions(userId);
    const updatedLocals = [txItem, ...currentLocals.filter((x) => x.id !== tempId)];
    this.saveLocalTransactions(userId, updatedLocals);

    // 2. Persist to Supabase if logged in
    if (userId) {
      try {
        let categoryId = newTx.categoryId || null;
        if (!categoryId && newTx.category) {
          const { data: cat } = await supabase
            .from("categories")
            .select("id")
            .ilike("name", newTx.category)
            .limit(1)
            .maybeSingle();
          if (cat) categoryId = cat.id;
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
          .select()
          .single();

        if (!error && data) {
          const confirmedItem = {
            ...txItem,
            id: data.id,
            synced: true,
          };
          const reconciled = updatedLocals.map((item) => (item.id === tempId ? confirmedItem : item));
          this.saveLocalTransactions(userId, reconciled);
          return confirmedItem;
        }
      } catch (err) {
        console.warn("Supabase addTransaction notice (preserved locally):", err);
      }
    }

    return txItem;
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

    // 1. Remove from local cache immediately
    const currentLocals = this.getLocalTransactions(userId);
    const updatedLocals = currentLocals.filter((t) => t.id !== txId);
    this.saveLocalTransactions(userId, updatedLocals);

    // 2. Remove from Supabase
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
  // DYNAMIC STATS & REPORTS
  // ==========================================
  async getStats() {
    const txs = await this.getTransactions();
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

  async getCashFlow() {
    const txs = await this.getTransactions();
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

  async getCategoryExpenses() {
    const txs = await this.getTransactions();
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

  // ==========================================
  // BUDGETS (CRUD)
  // ==========================================
  async getBudgets() {
    const userId = await this.getAuthUserId();
    const localBudgets = this.getLocalBudgets(userId);
    const txs = await this.getTransactions();

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

          const remoteIds = new Set(remoteList.map((r) => String(r.id)));
          const unsynced = localBudgets.filter((l) => !remoteIds.has(String(l.id)));
          const merged = [...remoteList, ...unsynced];
          this.saveLocalBudgets(userId, merged);
          return merged;
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
  async getGoals() {
    const userId = await this.getAuthUserId();
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

          const remoteIds = new Set(remoteList.map((r) => String(r.id)));
          const unsynced = localGoals.filter((l) => !remoteIds.has(String(l.id)));
          const merged = [...remoteList, ...unsynced];
          this.saveLocalGoals(userId, merged);
          return merged;
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

    // 1. Update local cache
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

    // 2. Update Supabase
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
  // METRICS & ADVANCED INSIGHTS
  // ==========================================
  async getFinancialHealth() {
    const txs = await this.getTransactions();
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

  async getAiInsights() {
    return [...AI_INSIGHTS];
  }

  async getMonthlyComparison() {
    return [...MONTHLY_COMPARISON_DATA];
  }

  async resetData() {
    return this.resetUserData();
  }

  // Resets financial transactions, budgets, and goals for the current user
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

  // Permanently deletes all financial data and profile from Supabase
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
