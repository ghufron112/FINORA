import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "../common/GlassCard";
import { formatRupiah } from "../../utils/formatters";
import { useFinance } from "../../context/FinanceContext";

export const CashFlowChart = () => {
  const { cashFlow } = useFinance();
  const [filter, setFilter] = useState("all"); // "all" | "income" | "expense"

  const chartData = cashFlow && cashFlow.length > 0 ? cashFlow : [
    { day: "5", pemasukan: 0, pengeluaran: 0 },
    { day: "10", pemasukan: 0, pengeluaran: 0 },
    { day: "15", pemasukan: 0, pengeluaran: 0 },
    { day: "20", pemasukan: 0, pengeluaran: 0 },
    { day: "25", pemasukan: 0, pengeluaran: 0 },
    { day: "31", pemasukan: 0, pengeluaran: 0 },
  ];

  // Custom Responsive Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl bg-white/95 dark:bg-[#091626]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.14] p-3.5 shadow-xl dark:shadow-2xl min-w-[190px]">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 border-b border-slate-100 dark:border-white/[0.06] pb-1">
            Tanggal {label} Oktober 2026
          </p>
          <div className="space-y-1.5 text-xs">
            {(filter === "all" || filter === "income") && payload.find((p) => p.dataKey === "pemasukan") && (
              <div className="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Pemasukan:
                </span>
                <span className="font-bold">
                  {formatRupiah(payload.find((p) => p.dataKey === "pemasukan")?.value)}
                </span>
              </div>
            )}
            {(filter === "all" || filter === "expense") && payload.find((p) => p.dataKey === "pengeluaran") && (
              <div className="flex items-center justify-between gap-3 text-rose-600 dark:text-rose-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Pengeluaran:
                </span>
                <span className="font-bold">
                  {formatRupiah(payload.find((p) => p.dataKey === "pengeluaran")?.value)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="p-5 sm:p-6 mb-7">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
              Arus Kas Bulanan
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[11px] font-semibold border border-teal-500/20">
              Oktober
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tren pergerakan pemasukan dan pengeluaran harian
          </p>
        </div>

        {/* Filter Pill Buttons */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/[0.06] self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-white dark:bg-gradient-to-r dark:from-teal-500/25 dark:to-blue-500/25 text-slate-900 dark:text-white border border-slate-200 dark:border-teal-400/30 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "income"
                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300"
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "expense"
                ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300"
            }`}
          >
            Pengeluaran
          </button>
        </div>
      </div>

      {/* Chart Legend Badges */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        {(filter === "all" || filter === "income") && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
            <span>Pemasukan</span>
          </div>
        )}
        {(filter === "all" || filter === "expense") && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
            <span>Pengeluaran</span>
          </div>
        )}
      </div>

      {/* Recharts Area Container */}
      <div className="w-full h-64 sm:h-72 lg:h-80 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {/* Income Gradient */}
              <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>

              {/* Expense Gradient */}
              <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.2)"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
              tickFormatter={(v) => `Tgl ${v}`}
            />

            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                if (val >= 1000000) return `${val / 1000000} jt`;
                if (val >= 1000) return `${val / 1000} rb`;
                return val;
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {(filter === "all" || filter === "income") && (
              <Area
                type="monotone"
                dataKey="pemasukan"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#incomeAreaGrad)"
                activeDot={{
                  r: 6,
                  fill: "#10B981",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            )}

            {(filter === "all" || filter === "expense") && (
              <Area
                type="monotone"
                dataKey="pengeluaran"
                stroke="#F43F5E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#expenseAreaGrad)"
                activeDot={{
                  r: 6,
                  fill: "#F43F5E",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
