import React from "react";
import { useFinance } from "../../context/FinanceContext";
import { HeroGreeting } from "./HeroGreeting";
import { StatCards } from "./StatCards";
import { CashFlowChart } from "./CashFlowChart";
import { CategoryDonutChart } from "./CategoryDonutChart";
import { AIInsightCard } from "./AIInsightCard";
import { SavingGoalCard } from "./SavingGoalCard";
import { GlassCard } from "../common/GlassCard";
import { formatRupiah, formatDateIndo } from "../../utils/formatters";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Receipt,
} from "lucide-react";

export const DashboardPage = () => {
  const { transactions, setActivePage } = useFinance();

  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-7 pb-10">
      {/* 1. Hero Greeting */}
      <HeroGreeting />

      {/* 2. Three Main Stat Cards */}
      <StatCards />

      {/* 3. Main Analytics Grid: Cash Flow (7 cols) + Category Donut (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <CashFlowChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryDonutChart />
        </div>
      </div>

      {/* 4. Secondary Action Row: AI Insight Card + Saving Goal Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <AIInsightCard />
        <SavingGoalCard />
      </div>

      {/* 5. Recent Activity Quick Glance */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Aktivitas Transaksi Terbaru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mutasi kas paling mutakhir</p>
            </div>
          </div>

          <button
            onClick={() => setActivePage("transaksi")}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-200 transition-colors group"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
          {recentTransactions.map((tx) => {
            const isIncome = tx.type === "income";

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/80 dark:hover:bg-white/[0.01] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIncome
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/25 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatDateIndo(tx.date)}</span>
                      <span>•</span>
                      <span>{tx.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-xs sm:text-sm font-extrabold font-display ${
                      isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"} {formatRupiah(tx.amount)}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {tx.paymentMethod || "Transfer"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
