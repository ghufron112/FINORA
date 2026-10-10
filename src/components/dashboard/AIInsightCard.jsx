import React from "react";
import { useFinance } from "../../context/FinanceContext";
import { Sparkles, ArrowRight, Zap, TrendingUp } from "lucide-react";

export const AIInsightCard = () => {
  const { setActivePage } = useFinance();

  return (
    <div className="relative rounded-[22px] p-5 sm:p-6 bg-gradient-to-br from-teal-50/95 via-sky-50/60 to-white dark:from-[#0B2138]/90 dark:via-[#0B1E33]/85 dark:to-[#081829]/90 backdrop-blur-2xl border border-teal-200/90 dark:border-teal-400/30 shadow-[0_4px_24px_-4px_rgba(13,148,136,0.08)] dark:shadow-[0_16px_40px_-10px_rgba(94,234,212,0.18)] flex flex-col justify-between overflow-hidden group transition-all duration-300 hover:border-teal-400/50">
      {/* Subtle organic ambient glow in card corner */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-400/20 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-400/30 transition-all duration-500" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header with AI badge */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 dark:bg-gradient-to-tr dark:from-teal-400/25 dark:to-blue-500/25 border border-teal-300 dark:border-teal-400/40 flex items-center justify-center text-teal-600 dark:text-teal-300 shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display">
                Insight AI
              </h3>
              <span className="text-[10px] text-teal-700 dark:text-teal-300 font-medium">Finora Intelligence Engine</span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current text-teal-600 dark:text-teal-400" />
            Smart Tip
          </span>
        </div>

        {/* Highlight observation */}
        <div className="p-3.5 rounded-2xl bg-white/85 dark:bg-[#071322]/70 border border-slate-200/80 dark:border-white/[0.06] mb-3.5 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              Pengeluaran makanan kamu bulan ini <span className="text-amber-600 dark:text-amber-300 font-bold">24% lebih tinggi</span> dari bulan lalu.
            </p>
          </div>
        </div>

        {/* Suggestion & Potential Impact */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
          Jika kamu mengurangi pengeluaran makanan sebesar <strong className="text-teal-700 dark:text-teal-300 font-semibold">Rp200.000</strong>, kamu bisa meningkatkan saldo akhir hingga <strong className="text-slate-900 dark:text-white font-semibold">Rp2.360.000</strong>.
        </p>
      </div>

      {/* Action CTA Button */}
      <div className="pt-2">
        <button
          onClick={() => setActivePage("insight")}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 active:scale-98 transition-all"
        >
          <span>Lihat Detail Wawasan</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
