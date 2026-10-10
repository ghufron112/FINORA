import React from "react";
import { useFinance } from "../../context/FinanceContext";
import { formatRupiah } from "../../utils/formatters";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const StatCards = () => {
  const { stats, setActivePage } = useFinance();

  const cards = [
    {
      id: "income",
      label: "Total Pemasukan",
      value: stats?.totalIncome !== undefined ? stats.totalIncome : 0,
      comparison: stats?.incomeComparison || "Rp 0 bulan ini",
      icon: TrendingUp,
      accent: "#10B981",
      bgGradient: "from-emerald-500/10 via-white to-white dark:from-emerald-500/10 dark:via-[#0F1D30]/80 dark:to-[#0F1D30]/60",
      borderColor: "border-slate-200/90 hover:border-emerald-500/40 dark:border-emerald-500/20 dark:hover:border-emerald-500/40",
      glowColor: "rgba(16, 185, 129, 0.12)",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
      trendIcon: ArrowUpRight,
      onClickPage: "transaksi",
    },
    {
      id: "expense",
      label: "Total Pengeluaran",
      value: stats?.totalExpense !== undefined ? stats.totalExpense : 0,
      comparison: stats?.expenseComparison || "Rp 0 bulan ini",
      icon: TrendingDown,
      accent: "#F43F5E",
      bgGradient: "from-rose-500/10 via-white to-white dark:from-rose-500/10 dark:via-[#0F1D30]/80 dark:to-[#0F1D30]/60",
      borderColor: "border-slate-200/90 hover:border-rose-500/40 dark:border-rose-500/20 dark:hover:border-rose-500/40",
      glowColor: "rgba(244, 63, 94, 0.12)",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
      trendIcon: ArrowDownRight,
      onClickPage: "transaksi",
    },
    {
      id: "balance",
      label: "Saldo Akhir",
      value: stats?.endingBalance !== undefined ? stats.endingBalance : 0,
      comparison: stats?.balanceComparison || "Mulai catat transaksi",
      icon: Wallet,
      accent: "#3B82F6",
      bgGradient: "from-blue-500/10 via-white to-white dark:from-blue-500/10 dark:via-[#0F1D30]/80 dark:to-[#0F1D30]/60",
      borderColor: "border-slate-200/90 hover:border-blue-500/40 dark:border-blue-500/20 dark:hover:border-blue-500/40",
      glowColor: "rgba(59, 130, 246, 0.12)",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
      trendIcon: ArrowUpRight,
      onClickPage: "analitik",
    },
  ];

  return (
    <div className="relative mb-7">
      {/* Container: Grid on desktop/tablet, horizontal scroll with snap on mobile */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 no-scrollbar snap-x snap-mandatory">
        {cards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trendIcon;

          return (
            <div
              key={card.id}
              onClick={() => setActivePage(card.onClickPage)}
              className={`min-w-[270px] sm:min-w-0 flex-1 snap-start relative rounded-[22px] p-5 sm:p-6 bg-gradient-to-br ${card.bgGradient} backdrop-blur-2xl border ${card.borderColor} shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
            >
              {/* Subtle top ambient glow */}
              <div
                className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-15 dark:opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"
                style={{ backgroundColor: card.accent }}
              />

              {/* Card Header: Icon & Tag */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-300 tracking-wide">
                  {card.label}
                </span>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                  style={{
                    backgroundColor: `${card.accent}15`,
                    border: `1px solid ${card.accent}30`,
                    color: card.accent,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Card Value (Rupiah) */}
              <div className="mb-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                  {formatRupiah(card.value)}
                </h3>
              </div>

              {/* Card Footer: Comparison Badge */}
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${card.badgeBg}`}
                >
                  <TrendIcon className="w-3.5 h-3.5" />
                  <span>{card.comparison}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
