import React, { useState, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { formatRupiah } from "../../utils/formatters";
import { GlassCard } from "../common/GlassCard";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const CalendarPage = () => {
  const { transactions } = useFinance();
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate() || 1);

  const daysInMonth = 31;
  const startDayOfWeek = 4; // Thursday

  // Map transactions to days in the current month
  const transactionsByDay = useMemo(() => {
    const map = {};
    for (let i = 1; i <= daysInMonth; i++) {
      map[i] = {
        income: 0,
        expense: 0,
        items: [],
      };
    }

    transactions.forEach((tx) => {
      try {
        const d = new Date(tx.date);
        const dayNum = d.getDate();
        if (dayNum >= 1 && dayNum <= daysInMonth) {
          if (tx.type === "income") {
            map[dayNum].income += Number(tx.amount || 0);
          } else {
            map[dayNum].expense += Number(tx.amount || 0);
          }
          map[dayNum].items.push(tx);
        }
      } catch {
        // ignore date error
      }
    });

    return map;
  }, [transactions]);

  const selectedData = transactionsByDay[selectedDay] || {
    income: 0,
    expense: 0,
    items: [],
  };

  const netCashFlow = selectedData.income - selectedData.expense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Kalender Transaksi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Pantau arus kas harian secara visual dan terjadwal.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0F1D30]/80 border border-slate-200/80 dark:border-white/[0.08] self-start sm:self-auto">
          <button className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white px-2">
            Oktober 2026
          </span>
          <button className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols on lg) */}
        <div className="lg:col-span-8">
          <GlassCard className="p-4 sm:p-6">
            {/* Weekdays header */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 text-center">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((wd, i) => (
                <div
                  key={wd}
                  className={`text-xs font-semibold py-1.5 ${
                    i === 0 ? "text-rose-500 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {/* Empty leading days */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-14 sm:h-20 rounded-2xl bg-transparent opacity-20"
                />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const data = transactionsByDay[dayNum];
                const isSelected = selectedDay === dayNum;
                const hasIncome = data.income > 0;
                const hasExpense = data.expense > 0;

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`h-14 sm:h-20 rounded-2xl p-1.5 sm:p-2 text-left flex flex-col justify-between transition-all duration-200 relative group ${
                      isSelected
                        ? "bg-teal-50 dark:bg-gradient-to-br dark:from-teal-500/20 dark:to-blue-500/20 border-teal-500 dark:border-teal-400/50 shadow-sm ring-2 ring-teal-500/30"
                        : "bg-slate-50 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]"
                    }`}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isSelected ? "text-teal-700 dark:text-teal-300" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Indicator dots */}
                      <div className="flex items-center gap-1">
                        {hasIncome && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-2xs" />
                        )}
                        {hasExpense && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-2xs" />
                        )}
                      </div>
                    </div>

                    {/* Micro net flow indicator on desktop */}
                    <div className="hidden sm:block">
                      {hasIncome && !hasExpense && (
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                          +{formatRupiah(data.income, false)}
                        </p>
                      )}
                      {hasExpense && !hasIncome && (
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 truncate">
                          -{formatRupiah(data.expense, false)}
                        </p>
                      )}
                      {hasIncome && hasExpense && (
                        <p className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 truncate">
                          {(data.income - data.expense) >= 0 ? "+" : ""}
                          {formatRupiah(data.income - data.expense, false)}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Selected Day Detail Sidebar (4 cols on lg) */}
        <div className="lg:col-span-4">
          <GlassCard className="p-5 sm:p-6 h-full flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      {selectedDay} Oktober 2026
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ringkasan transaksi harian</p>
                  </div>
                </div>
              </div>

              {/* Day Net Summary Cards */}
              <div className="space-y-2.5 mb-5">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Pemasukan</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-display">
                    + {formatRupiah(selectedData.income)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Pengeluaran</span>
                  </div>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-display">
                    - {formatRupiah(selectedData.expense)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/[0.03] dark:border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Net Cash Flow:</span>
                  <span
                    className={`text-sm font-extrabold font-display ${
                      netCashFlow >= 0 ? "text-teal-700 dark:text-teal-300" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {netCashFlow >= 0 ? "+ " : "- "}
                    {formatRupiah(Math.abs(netCashFlow))}
                  </span>
                </div>
              </div>

              {/* Transactions List on Selected Day */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Daftar Transaksi ({selectedData.items.length})
                </h4>

                {selectedData.items.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4 text-center">
                    Tidak ada catatan transaksi pada tanggal ini.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedData.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.category}</span>
                        </div>
                        <span
                          className={`text-xs font-bold font-display ${
                            item.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {item.type === "income" ? "+" : "-"} {formatRupiah(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-3 border-t border-slate-200/80 dark:border-white/[0.06] mt-4">
              Pilih tanggal lain pada kalender untuk melihat detail arus kasnya.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
