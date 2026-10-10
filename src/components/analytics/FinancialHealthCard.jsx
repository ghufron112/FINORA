import React from "react";
import { GlassCard } from "../common/GlassCard";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export const FinancialHealthCard = ({ healthData }) => {
  const score = healthData?.score ?? 82;
  const status = healthData?.status ?? "Good";

  const breakdown = healthData?.breakdown ?? [
    { label: "Savings Rate", score: 85, color: "#10B981" },
    { label: "Spending Control", score: 78, color: "#3B82F6" },
    { label: "Budget Adherence", score: 82, color: "#14B8A6" },
    { label: "Consistency", score: 90, color: "#F59E0B" },
    { label: "Debt Ratio", score: 75, color: "#8B5CF6" },
  ];

  // Circular gauge calculations (semi-circle gauge)
  const radius = 46;
  const circumference = Math.PI * radius; // 180 degrees
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <GlassCard className="p-5 sm:p-6 h-full flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Financial Health
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Skor kesehatan finansial holistik</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300 text-xs font-bold">
            {status}
          </span>
        </div>

        {/* Semi-circular gauge container */}
        <div className="relative w-44 h-28 mx-auto flex items-end justify-center mb-3">
          <svg className="w-44 h-28 overflow-visible" viewBox="0 0 120 70">
            {/* Background semi-circle track */}
            <path
              d="M 14 62 A 46 46 0 0 1 106 62"
              fill="none"
              className="stroke-slate-200 dark:stroke-white/[0.08]"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Glowing progress arc */}
            <path
              d="M 14 62 A 46 46 0 0 1 106 62"
              fill="none"
              stroke="url(#healthGrad)"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#14B8A6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central score number */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              {score}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Sangat Sehat
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">
          Arus kas surplus, tabungan berjalan konsisten dan tidak ada beban hutang berisiko.
        </p>
      </div>

      {/* Breakdown Items */}
      <div className="space-y-2.5 pt-3 border-t border-slate-200/80 dark:border-white/[0.06]">
        {breakdown.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
              <span className="font-bold text-slate-900 dark:text-white">{item.score}</span>
            </div>
            {/* Thin progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${item.score}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
