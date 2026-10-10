import React from "react";
import { useFinance } from "../../context/FinanceContext";
import { Sparkles, Calendar, ArrowUpRight } from "lucide-react";

export const HeroGreeting = () => {
  const { user, session, setActivePage } = useFinance();

  const displayName = session ? (user?.name || "User") : "User";
  const firstName = displayName.split(" ")[0] || "User";

  return (
    <div className="relative mb-6 sm:mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-700 dark:text-teal-300 text-xs font-medium mb-2.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300 animate-pulse" />
            <span>Finora Intelligence Aktif</span>
            <span className="text-slate-300 dark:text-white/30">•</span>
            <span className="text-slate-600 dark:text-slate-300">Oktober 2026</span>
          </div>

          {/* Large Modern Typography */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Hallo, {firstName} <span className="inline-block animate-bounce">👋</span>
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Berikut adalah ringkasan keuanganmu bulan ini. Tetap konsisten, kamu sudah berada di jalur yang tepat!
          </p>
        </div>

        {/* Quick info chip */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage("kalender")}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#0F1D30]/60 hover:bg-slate-50 dark:hover:bg-[#0F1D30]/90 border border-slate-200/90 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Kalender Keuangan</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
