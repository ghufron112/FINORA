import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { formatRupiah } from "../../utils/formatters";
import { GlassCard } from "../common/GlassCard";
import { FinancialHealthCard } from "./FinancialHealthCard";
import { CategoryDonutChart } from "../dashboard/CategoryDonutChart";
import { MONTHLY_COMPARISON_DATA } from "../../data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export const AnalyticsPage = () => {
  const { stats, financialHealth } = useFinance();
  const [activeTab, setActiveTab] = useState("ringkasan"); // "ringkasan" | "kategori" | "perbandingan"

  const savingsRate = stats?.totalIncome
    ? Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)
    : 41;

  // Custom Recharts Bar Tooltip
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl bg-white/95 dark:bg-[#091626]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.12] p-3 shadow-xl dark:shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-900 dark:text-white mb-1">Bulan {label}</p>
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
              <span className="font-semibold text-slate-800 dark:text-white">
                {formatRupiah(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Analitik
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Kenali pola keuanganmu lebih dalam.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#0F1D30]/80 border border-slate-200/80 dark:border-white/[0.08] self-start sm:self-auto">
          {[
            { id: "ringkasan", label: "Ringkasan" },
            { id: "kategori", label: "Kategori" },
            { id: "perbandingan", label: "Perbandingan" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-teal-400/30 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Highlight Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <GlassCard className="p-4 sm:p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Pemasukan</span>
          <p className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display mt-1">
            {formatRupiah(stats?.totalIncome ?? 5280000)}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium inline-block mt-1">
            ↑ 12% dari target
          </span>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Pengeluaran</span>
          <p className="text-lg sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-display mt-1">
            {formatRupiah(stats?.totalExpense ?? 3120000)}
          </p>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium inline-block mt-1">
            59.1% dari rasio
          </span>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Savings Rate</span>
          <p className="text-lg sm:text-2xl font-extrabold text-teal-700 dark:text-teal-300 font-display mt-1">
            {savingsRate}%
          </p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium inline-block mt-1">
            Sangat Sehat (&gt;20%)
          </span>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Financial Health</span>
          <p className="text-lg sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-display mt-1">
            {financialHealth?.score ?? 82}/100
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium inline-block mt-1">
            Status: Good
          </span>
        </GlassCard>
      </div>

      {/* Tab 1: Ringkasan */}
      {activeTab === "ringkasan" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Financial Health Gauge (5 cols) */}
          <div className="lg:col-span-5">
            <FinancialHealthCard healthData={financialHealth} />
          </div>

          {/* Trend Tabungan 6 Bulan (7 cols) */}
          <div className="lg:col-span-7">
            <GlassCard className="p-5 sm:p-6 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                    Trend Tabungan 6 Bulan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Akumulasi surplus kas bulanan
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-400/10 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-400/20">
                  Konsisten Naik
                </div>
              </div>

              <div className="w-full h-64 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_COMPARISON_DATA}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.2)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000000).toFixed(1)} jt`}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="savings"
                      name="Surplus / Tabungan"
                      stroke="#14B8A6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#14B8A6" }}
                      activeDot={{ r: 6, fill: "#14B8A6", stroke: "#FFF", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/80 dark:border-white/[0.06] mt-2">
                <span>Rata-rata tabungan bulanan: <strong className="text-slate-900 dark:text-white">Rp 1.710.000</strong></span>
                <span className="text-teal-600 dark:text-teal-300 font-semibold">+54% vs Mei</span>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Tab 2: Kategori */}
      {activeTab === "kategori" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <CategoryDonutChart />
          </div>

          <div className="lg:col-span-6">
            <GlassCard className="p-5 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display mb-1">
                  Evaluasi Alokasi Pengeluaran
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Analisis porsi pos biaya terhadap rekomendasi 50/30/20 rule
                </p>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">Kebutuhan Pokok (Needs - 50%)</span>
                      <span className="text-teal-600 dark:text-teal-400">46% (Ideal)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: "46%" }} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">Makanan, Kos, Wifi, dan Transportasi pokok terkontrol dengan sangat baik.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">Keinginan & Lifestyle (Wants - 30%)</span>
                      <span className="text-amber-600 dark:text-amber-400">13% (Aman)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "13%" }} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">Hiburan dan belanja kafe masih jauh di bawah batas maksimum gaya hidup.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">Tabungan & Investasi (Savings - 20%)</span>
                      <span className="text-emerald-600 dark:text-emerald-400">41% (Superior)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "41%" }} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">Tingkat tabungan melampaui standar 20%, mempercepat pencapaian Laptop baru.</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Tab 3: Perbandingan */}
      {activeTab === "perbandingan" && (
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                Perbandingan Arus Kas Bulanan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Perbandingan pemasukan vs pengeluaran selama 6 bulan terakhir
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span>Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-md bg-rose-500" />
                <span>Pengeluaran</span>
              </div>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_COMPARISON_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.2)"
                  vertical={false}
                />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)} jt`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="income"
                  name="Pemasukan"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="expense"
                  name="Pengeluaran"
                  fill="#F43F5E"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
