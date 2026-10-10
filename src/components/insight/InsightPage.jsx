import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { formatRupiah } from "../../utils/formatters";
import { GlassCard } from "../common/GlassCard";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Zap,
  Sliders,
  ChevronRight,
  TrendingDown,
} from "lucide-react";

export const InsightPage = () => {
  const { insights, stats, setActivePage } = useFinance();
  const [savingsSimulation, setSavingsSimulation] = useState(200000);

  const annualImpact = savingsSimulation * 12;
  const newProjectedBalance = (stats?.endingBalance ?? 2160000) + savingsSimulation;

  const getInsightBadge = (type) => {
    switch (type) {
      case "danger":
        return {
          icon: AlertTriangle,
          badgeText: "Perhatian Khusus",
          badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300",
          cardVariant: "expense",
        };
      case "opportunity":
        return {
          icon: Lightbulb,
          badgeText: "Peluang Hemat",
          badgeClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:border-teal-500/30 dark:text-teal-300",
          cardVariant: "teal",
        };
      case "positive":
        return {
          icon: TrendingDown,
          badgeText: "Tren Positif",
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300",
          cardVariant: "income",
        };
      default:
        return {
          icon: TrendingUp,
          badgeText: "Pola Pengeluaran",
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300",
          cardVariant: "warning",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300 animate-pulse" />
            <span>Finora Neural Financial Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Insight AI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Rekomendasi cerdas berbasis pola keuanganmu untuk akselerasi tujuan.
          </p>
        </div>

        <button
          onClick={() => setActivePage("budget")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all self-start sm:self-auto shadow-2xs"
        >
          <span>Sesuaikan Budget</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {insights.map((item) => {
          const config = getInsightBadge(item.type);
          const Icon = config.icon;

          return (
            <GlassCard
              key={item.id}
              variant={config.cardVariant}
              className="p-5 sm:p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Header: Tag & Severity Badge */}
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{config.badgeText}</span>
                  </span>
                </div>

                {/* Title & Core Finding */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
                  "{item.content}"
                </p>

                {/* Actionable Recommendation */}
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#050C16]/60 border border-slate-200/80 dark:border-white/[0.06] mb-4 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {item.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Potential Saving Chip */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-slate-500 dark:text-slate-400">Potensi Optimalisasi:</span>
                <span className="text-teal-700 dark:text-teal-300 font-extrabold font-display text-sm">
                  {formatRupiah(item.potentialSaving)} / bln
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Interactive Savings Simulator */}
      <GlassCard className="p-5 sm:p-7 bg-gradient-to-br from-teal-50/90 via-sky-50/70 to-emerald-50/60 dark:from-[#0F233B]/90 dark:via-[#0B1A2C]/85 dark:to-[#081321] border border-teal-200/90 dark:border-teal-500/25">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Simulasi Efisiensi Pengeluaran
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mb-5">
              Geser nilai penghematan yang ingin kamu alokasikan dari pos makanan / entertainment untuk melihat proyeksi peningkatan saldo bulanan dan akumulasi 1 tahun.
            </p>

            {/* Slider */}
            <div className="space-y-2 max-w-lg">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Rp 50.000</span>
                <span className="text-teal-700 dark:text-teal-300 font-bold text-sm">
                  {formatRupiah(savingsSimulation)}
                </span>
                <span>Rp 1.000.000</span>
              </div>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="50000"
                value={savingsSimulation}
                onChange={(e) => setSavingsSimulation(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-slate-200 dark:bg-white/[0.1] accent-teal-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="grid grid-cols-2 gap-3.5 min-w-[280px]">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#071322]/80 border border-teal-200 dark:border-teal-500/20 shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                Saldo Akhir Baru
              </span>
              <p className="text-lg sm:text-xl font-extrabold text-teal-700 dark:text-teal-300 font-display">
                {formatRupiah(newProjectedBalance)}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+ dari Rp 2,16 jt</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#071322]/80 border border-blue-200 dark:border-blue-500/20 shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                Tambahan 1 Tahun
              </span>
              <p className="text-lg sm:text-xl font-extrabold text-blue-700 dark:text-blue-400 font-display">
                {formatRupiah(annualImpact)}
              </p>
              <span className="text-[10px] text-blue-600 dark:text-blue-300 font-semibold">Bisa beli laptop baru!</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
