import React, { useState, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { formatRupiah, formatDateIndo } from "../../utils/formatters";
import { GlassCard } from "../common/GlassCard";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  Briefcase,
} from "lucide-react";

export const TransactionsPage = () => {
  const { transactions, deleteTransaction, setIsAddTxModalOpen } = useFinance();

  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "income" | "expense"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Icon mapping
  const getCategoryIcon = (category, type) => {
    switch (category) {
      case "Makanan":
        return <Utensils className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      case "Transportasi":
        return <Car className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case "Belanja":
        return <ShoppingBag className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case "Tagihan":
        return <Receipt className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      case "Entertainment":
      case "Hiburan":
        return <Film className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
      case "Gaji":
      case "Freelance":
      case "Pemasukan":
        return <Briefcase className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      default:
        return type === "income" ? (
          <ArrowUpRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-rose-500 dark:text-rose-400" />
        );
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = typeFilter === "all" || tx.type === typeFilter;
      const matchesSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || tx.category === selectedCategory;
      return matchesType && matchesSearch && matchesCategory;
    });
  }, [transactions, typeFilter, searchQuery, selectedCategory]);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Transaksi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Kelola seluruh pemasukan dan pengeluaranmu.
          </p>
        </div>

        <button
          onClick={() => setIsAddTxModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0F1D30]/70 border border-emerald-200 dark:border-emerald-500/20 shadow-xs backdrop-blur-xl">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Masuk (Tersaring)</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-display mt-1">
            {formatRupiah(totalFilteredIncome)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0F1D30]/70 border border-rose-200 dark:border-rose-500/20 shadow-xs backdrop-blur-xl">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Keluar (Tersaring)</span>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 font-display mt-1">
            {formatRupiah(totalFilteredExpense)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0F1D30]/70 border border-teal-200 dark:border-teal-500/20 shadow-xs backdrop-blur-xl">
          <span className="text-xs text-slate-500 dark:text-slate-400">Arus Kas Bersih</span>
          <p className="text-xl font-bold text-teal-700 dark:text-teal-300 font-display mt-1">
            {formatRupiah(totalFilteredIncome - totalFilteredExpense)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan nama, catatan, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:outline-none text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#071322] border border-slate-200/80 dark:border-white/[0.08]">
              {["all", "income", "expense"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    typeFilter === t
                      ? "bg-white dark:bg-teal-500/25 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-teal-400/30 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {t === "all" ? "Semua" : t === "income" ? "Pemasukan" : "Pengeluaran"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Transaction List */}
      <GlassCard className="divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tidak ada transaksi yang cocok.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === "income";

            return (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isIncome
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"
                        : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30"
                    }`}
                  >
                    {getCategoryIcon(tx.category, tx.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                        {tx.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 hidden xs:inline">
                        {tx.paymentMethod || "Transfer"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatDateIndo(tx.date)}</span>
                      <span>•</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{tx.category}</span>
                      {tx.note && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline truncate max-w-xs text-slate-400">
                            {tx.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-sm sm:text-base font-extrabold font-display ${
                        isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"} {formatRupiah(tx.amount)}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                      {isIncome ? "Masuk" : "Keluar"}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </GlassCard>
    </div>
  );
};
