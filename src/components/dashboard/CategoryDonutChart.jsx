import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "../common/GlassCard";
import { formatRupiah } from "../../utils/formatters";
import { useFinance } from "../../context/FinanceContext";
import { PieChart as PieIcon, PlusCircle } from "lucide-react";

export const CategoryDonutChart = () => {
  const { categoryExpenses, stats, setIsAddTxModalOpen } = useFinance();
  const [activeIndex, setActiveIndex] = useState(null);

  const totalExpense = stats?.totalExpense || 0;
  const data = categoryExpenses || [];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div className="rounded-2xl bg-white/95 dark:bg-[#091626]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.12] p-3 shadow-xl dark:shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-bold text-slate-900 dark:text-white">{entry.name}</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{formatRupiah(entry.value)}</p>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">{entry.percentage}% dari total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="p-5 sm:p-6 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
              Pengeluaran per Kategori
            </h3>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Proporsi alokasi pengeluaran bulan ini</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          <PieIcon className="w-4 h-4" />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="my-auto py-8 sm:py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
            <PieIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Belum Ada Pengeluaran
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
            Catat transaksi pengeluaran pertamamu untuk melihat visualisasi alokasi kategori di sini.
          </p>
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Catat Pengeluaran</span>
          </button>
        </div>
      ) : (
        <>
          {/* Donut Chart Container + Center Label */}
          <div className="relative w-full h-56 sm:h-64 my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={92}
                  paddingAngle={4}
                  dataKey="percentage"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  stroke="transparent"
                  strokeWidth={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        filter:
                          activeIndex === index
                            ? `drop-shadow(0 0 10px ${entry.color}88)`
                            : "none",
                        transform: activeIndex === index ? "scale(1.04)" : "scale(1)",
                        transformOrigin: "center center",
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Donut Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 tracking-wide uppercase">
                Total Pengeluaran
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
                {formatRupiah(totalExpense)}
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-300 font-medium">
                {data.length} Kategori
              </span>
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-200/80 dark:border-white/[0.06] mt-2">
            {data.map((item, index) => (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                  activeIndex === index
                    ? "bg-slate-100 dark:bg-white/[0.08] border-teal-500/30 dark:border-white/[0.2] scale-[1.02]"
                    : "bg-slate-50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.04] hover:bg-slate-100/70 dark:hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0 ml-1">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
};
