// Finora Supabase Service Layer
// Integrates Supabase PostgreSQL & Auth with fallback for offline preview

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

  // Helper to get currently authenticated user ID
  async getAuthUserId() {
    if (!this.isConfigured) return null;
    try {
      // 1. Check local session cache first (instant, avoids redundant network roundtrips)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        return sessionData.session.user.id;
      }
      // 2. Fallback to getUser()
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
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
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          authUser = sessionData.session.user;
        } else {
          const { data: authData } = await supabase.auth.getUser();
          authUser = authData?.user;
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

        const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}&backgroundColor=0f766e,0d9488&textColor=ffffff`;

        return {
          name: resolvedName,
          email: authUser?.email || "user@finora.id",
          avatar: profile?.avatar_url || fallbackAvatar,
          hasCustomAvatar: Boolean(profile?.avatar_url),
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
      try {
        const updatePayload = {
          updated_at: new Date().toISOString(),
        };
        if (fullName !== undefined) updatePayload.full_name = fullName;
        if (avatarUrl !== undefined) updatePayload.avatar_url = avatarUrl;

        const { data, error } = await supabase
          .from("profiles")
          .upsert({ id: userId, ...updatePayload })
          .select()
          .single();

        if (error) throw error;

        try {
          const authUpdate = {};
          if (fullName !== undefined) authUpdate.full_name = fullName;
          if (avatarUrl !== undefined) authUpdate.avatar_url = avatarUrl;
          await supabase.auth.updateUser({ data: authUpdate });
        } catch {}

        return data;
      } catch (err) {
        console.error("Supabase updateProfile error:", err);
        throw err;
      }
    }

    return null;
  }

  // ==========================================
  // TRANSACTIONS (CRUD)
  // ==========================================
  async getTransactions() {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*, categories(name, color, icon)")
          .eq("user_id", userId)
          .order("occurred_at", { ascending: false });

        if (!error) {
          // Map PostgreSQL columns to Finora UI expected schema
          return (data || []).map((t) => ({
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
          }));
        }
        return [];
      } catch (err) {
        console.warn("Supabase getTransactions failed:", err);
        return [];
      }
    }

    // LocalStorage fallback only for unauthenticated guest preview
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TX);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  async addTransaction(newTx) {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        // Find matching category ID if category name was provided
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

        const dateIso = newTx.date
          ? new Date(newTx.date).toISOString()
          : new Date().toISOString();

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

        if (error) throw error;

        return {
          id: data.id,
          title: data.description,
          amount: Number(data.amount),
          type: data.type,
          category: newTx.category || "Lainnya",
          date: data.occurred_at.split("T")[0],
          paymentMethod: data.payment_method,
          note: data.note,
        };
      } catch (err) {
        console.error("Supabase addTransaction error:", err);
      }
    }

    // Fallback: local storage
    const current = await this.getTransactions();
    const txWithId = {
      ...newTx,
      id: `tx-${Date.now()}`,
      amount: Number(newTx.amount),
    };
    const updated = [txWithId, ...current];
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
    } catch {}
    return txWithId;
  }

  async deleteTransaction(txId) {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", txId)
          .eq("user_id", userId);
        if (!error) return true;
      } catch (err) {
        console.warn("Supabase deleteTransaction error:", err);
      }
    }

    const current = await this.getTransactions();
    const updated = current.filter((t) => t.id !== txId);
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
    } catch {}
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
    if (userId) {
      try {
        const { data, error } = await supabase
          .from("budgets")
          .select("*")
          .eq("user_id", userId);

        if (!error) {
          const txs = await this.getTransactions();
          return (data || []).map((b) => {
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
            };
          });
        }
        return [];
      } catch (err) {
        console.warn("Supabase getBudgets failed:", err);
        return [];
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  async addBudget(newBudget) {
    const userId = await this.getAuthUserId();
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
          return {
            id: data.id,
            category: data.category_name,
            spent: 0,
            limit: Number(data.amount_limit),
            percentage: 0,
            isExceeded: false,
          };
        }
      } catch (err) {
        console.warn("Supabase addBudget failed:", err);
      }
    }

    const current = await this.getBudgets();
    const budgetWithId = {
      ...newBudget,
      id: `b-${Date.now()}`,
      spent: Number(newBudget.spent || 0),
      limit: Number(newBudget.limit),
      percentage: Math.round(((newBudget.spent || 0) / newBudget.limit) * 100),
      isExceeded: (newBudget.spent || 0) > newBudget.limit,
    };
    const updated = [...current, budgetWithId];
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(updated));
    return budgetWithId;
  }

  // ==========================================
  // SAVINGS GOALS (CRUD)
  // ==========================================
  async getGoals() {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        const { data, error } = await supabase
          .from("savings_goals")
          .select("*")
          .eq("user_id", userId);

        if (!error) {
          return (data || []).map((g) => {
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
            };
          });
        }
        return [];
      } catch (err) {
        console.warn("Supabase getGoals failed:", err);
        return [];
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_GOALS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  async addGoal(newGoal) {
    const userId = await this.getAuthUserId();
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
          const current = Number(data.current_amount || 0);
          const target = Number(data.target_amount);
          return {
            id: data.id,
            name: data.name,
            current,
            target,
            percentage: Math.min(100, Math.round((current / target) * 100)),
            date: data.target_date,
            color: data.color,
          };
        }
      } catch (err) {
        console.warn("Supabase addGoal failed:", err);
      }
    }

    const current = await this.getGoals();
    const goalWithId = {
      ...newGoal,
      id: `g-${Date.now()}`,
      current: Number(newGoal.current || 0),
      target: Number(newGoal.target),
      percentage: Math.min(100, Math.round(((newGoal.current || 0) / newGoal.target) * 100)),
    };
    const updated = [...current, goalWithId];
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(updated));
    return goalWithId;
  }

  async updateGoalDeposit(goalId, amountToAdd) {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        const { data: currentGoal } = await supabase
          .from("savings_goals")
          .select("current_amount")
          .eq("id", goalId)
          .single();

        if (currentGoal) {
          const newCurrent = Number(currentGoal.current_amount || 0) + Number(amountToAdd);
          await supabase
            .from("savings_goals")
            .update({ current_amount: newCurrent })
            .eq("id", goalId);
          return await this.getGoals();
        }
      } catch (err) {
        console.warn("Supabase updateGoalDeposit failed:", err);
      }
    }

    const current = await this.getGoals();
    const updated = current.map((g) => {
      if (g.id === goalId) {
        const newCurrent = g.current + Number(amountToAdd);
        return {
          ...g,
          current: newCurrent,
          percentage: Math.min(100, Math.round((newCurrent / g.target) * 100)),
        };
      }
      return g;
    });
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(updated));
    return updated;
  }

  // ==========================================
  // INSIGHTS & MONTHLY COMPARISON
  // ==========================================
  async getFinancialHealth() {
    const stats = await this.getStats();
    const ratio = stats.totalIncome > 0
      ? Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)
      : 50;
    const score = Math.max(30, Math.min(95, 60 + Math.round(ratio / 3)));

    return {
      score,
      status: score >= 80 ? "Sangat Baik" : score >= 60 ? "Baik & Sehat" : "Perlu Perhatian",
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

  // Resets financial transactions, budgets, and goals for the current user in Supabase
  // Data is permanently preserved unless the user explicitly invokes this reset
  async resetUserData() {
    const userId = await this.getAuthUserId();
    if (userId) {
      try {
        await supabase.from("transactions").delete().eq("user_id", userId);
        await supabase.from("budgets").delete().eq("user_id", userId);
        await supabase.from("savings_goals").delete().eq("user_id", userId);
        await supabase.from("accounts").update({ current_balance: 0 }).eq("user_id", userId);
        return true;
      } catch (err) {
        console.error("Supabase resetUserData error:", err);
        throw err;
      }
    }

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
        return true;
      } catch (err) {
        console.error("Supabase deleteAccount error:", err);
        throw err;
      }
    }

    localStorage.clear();
    return true;
  }
}

export const financeService = new FinanceService();
