import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { formatRupiah } from "../../utils/formatters";
import { GlassCard } from "../common/GlassCard";
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  Plus,
  AlertTriangle,
  PieChart,
  X,
} from "lucide-react";

export const BudgetPage = () => {
  const { budgets, addBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [spentAmount, setSpentAmount] = useState("");

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Makanan":
        return <Utensils className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
      case "Transportasi":
        return <Car className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case "Belanja":
        return <ShoppingBag className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case "Tagihan":
        return <Receipt className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
      case "Entertainment":
      case "Hiburan":
        return <Film className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
      default:
        return <PieChart className="w-5 h-5 text-teal-500 dark:text-teal-400" />;
    }
  };

  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);
  const totalLimit = budgets.reduce((sum, b) => sum + Number(b.limit || 0), 0);
  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const handleCreateBudget = (e) => {
    e.preventDefault();
    if (!categoryName || !limitAmount) return;

    addBudget({
      category: categoryName,
      limit: Number(limitAmount),
      spent: Number(spentAmount || 0),
      color: "#14B8A6",
    });

    setCategoryName("");
    setLimitAmount("");
    setSpentAmount("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Budget
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Atur batas pengeluaran agar keuangan tetap terkendali.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Budget</span>
        </button>
      </div>

      {/* Overall Budget Status Banner */}
      <GlassCard className="p-5 sm:p-6 bg-gradient-to-r from-teal-50/90 via-sky-50/70 to-emerald-50/60 dark:from-[#0F2238]/90 dark:via-[#0B1A2E]/80 dark:to-[#0F1D30]/90 border border-teal-200/90 dark:border-teal-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Ringkasan Anggaran Oktober
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                {formatRupiah(totalSpent)}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                / {formatRupiah(totalLimit)} ({overallPercentage}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold">
              Sisa 25 Hari Bulan Ini
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-200/80 dark:bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 via-blue-500 to-emerald-500 transition-all duration-1000 shadow-sm"
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </GlassCard>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.length === 0 ? (
          <GlassCard className="p-8 sm:p-12 text-center col-span-full">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
              <PieChart className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Belum Ada Anggaran Kategori
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">
              Tetapkan batas pengeluaran untuk kategorimu agar keuangan tetap terkontrol.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Anggaran Sekarang</span>
            </button>
          </GlassCard>
        ) : (
          budgets.map((item) => {
            const isExceeded = (item.spent || 0) > (item.limit || 1);
            const percentage = item.limit > 0 ? Math.round(((item.spent || 0) / item.limit) * 100) : 0;

          return (
            <GlassCard
              key={item.id}
              className={`p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 ${
                isExceeded
                  ? "bg-rose-50/70 dark:bg-gradient-to-br dark:from-[#1C0D18]/90 dark:to-[#0F1D30]/85 border border-rose-300 dark:border-rose-500/35 shadow-xs dark:shadow-[0_12px_36px_-10px_rgba(251,113,133,0.18)]"
                  : "hover:border-teal-400/50 dark:hover:border-white/[0.14]"
              }`}
            >
              {/* Header: Icon & Category */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                      isExceeded
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400"
                        : "bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]"
                    }`}
                  >
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      {item.category}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Limit {formatRupiah(item.limit)}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-sm font-extrabold font-display ${
                    isExceeded ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {percentage}%
                </span>
              </div>

              {/* Amounts */}
              <div className="mb-3">
                <div className="flex items-baseline justify-between text-xs sm:text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Terpakai:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatRupiah(item.spent)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isExceeded
                      ? "bg-rose-500"
                      : percentage > 80
                      ? "bg-amber-500"
                      : "bg-teal-500"
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              {/* Status footer banner */}
              <div>
                {isExceeded ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-300 dark:bg-rose-500/15 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>⚠ Budget terlampaui (+{formatRupiah(item.spent - item.limit)})</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Sisa anggaran:</span>
                    <span className="text-teal-700 dark:text-teal-300 font-semibold">
                      {formatRupiah(item.limit - item.spent)}
                    </span>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })
      )}
      </div>

      {/* Modal Tambah Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B1829] border border-slate-200 dark:border-white/[0.12] p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Tambah Anggaran Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Buku & Kuliah, Olahraga"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Limit Maksimum (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 500000"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pengeluaran Saat Ini (Rp, Opsional)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={spentAmount}
                  onChange={(e) => setSpentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] text-slate-900 dark:text-white text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-sm shadow-md"
              >
                Simpan Anggaran
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
