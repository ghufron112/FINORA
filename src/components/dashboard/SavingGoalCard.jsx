import React from "react";
import { useFinance } from "../../context/FinanceContext";
import { GlassCard } from "../common/GlassCard";
import { formatRupiah } from "../../utils/formatters";
import { Target, Laptop, ChevronRight, Clock, Plus, PlusCircle } from "lucide-react";

export const SavingGoalCard = () => {
  const { goals, setActivePage, depositToGoal, setIsAddGoalModalOpen } = useFinance();

  const primaryGoal = goals && goals.length > 0 ? (goals.find((g) => g.isPrimary) || goals[0]) : null;

  if (!primaryGoal) {
    return (
      <GlassCard className="p-5 sm:p-6 flex flex-col justify-between h-full group">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display">
                Target Menabung
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tujuan prioritas aktif</p>
            </div>
          </div>

          <div className="py-6 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
            <p className="text-xs font-semibold text-slate-800 dark:text-white mb-1">
              Belum Ada Target Aktif
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mb-3">
              Rencanakan impianmu seperti gadget baru, dana darurat, atau investasi.
            </p>
            <button
              onClick={() => setIsAddGoalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Buat Target Tabungan</span>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setActivePage("tujuan")}
            className="w-full flex items-center justify-between py-2 px-4 rounded-2xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.09] text-xs font-semibold text-slate-800 dark:text-white transition-all"
          >
            <span>Halaman Tujuan Keuangan</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </GlassCard>
    );
  }

  const percentage = Math.round(((primaryGoal.current || 0) / (primaryGoal.target || 1)) * 100);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

  return (
    <GlassCard className="p-5 sm:p-6 flex flex-col justify-between h-full group">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display">
                Target Menabung
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tujuan prioritas aktif</p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-400/10 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-400/20">
            <Clock className="w-3 h-3" />
            <span>{primaryGoal.estimate || primaryGoal.date || "Target Aktif"}</span>
          </span>
        </div>

        {/* Goal Detail & Circular Gauge Box */}
        <div className="flex items-center gap-4 sm:gap-6 my-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
          {/* Circular Progress Gauge */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200 dark:stroke-white/[0.08]"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-teal-500 dark:stroke-teal-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Percentage text in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                {percentage}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                Tercapai
              </span>
            </div>
          </div>

          {/* Goal Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <Laptop className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">{primaryGoal.name || primaryGoal.title}</span>
            </div>

            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-display">
              {formatRupiah(primaryGoal.current || 0)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              dari target <span className="text-slate-700 dark:text-slate-300 font-medium">{formatRupiah(primaryGoal.target)}</span>
            </p>

            {/* Quick deposit chip */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                depositToGoal(primaryGoal.id, 100000);
              }}
              className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-[11px] font-semibold border border-teal-200 dark:border-teal-500/30 transition-all active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>+ Tabung Rp100rb</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={() => setActivePage("tujuan")}
          className="w-full flex items-center justify-between py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.09] border border-slate-200/90 dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-slate-800 dark:text-white transition-all shadow-2xs"
        >
          <span>Lihat Semua Tujuan</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </GlassCard>
  );
};
