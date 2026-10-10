import React, { useState, useEffect, useRef } from "react";
import { useFinance } from "../../context/FinanceContext";
import { formatRupiah } from "../../utils/formatters";
import {
  Search,
  X,
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  PieChart,
  Target,
  CalendarDays,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export const SearchModal = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    transactions,
    goals,
    setActivePage,
  } = useFinance();

  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const navItems = [
    { id: "dashboard", label: "Dashboard", desc: "Ringkasan finansial utama", icon: LayoutDashboard },
    { id: "transaksi", label: "Transaksi", desc: "Riwayat arus kas masuk & keluar", icon: ReceiptText },
    { id: "analitik", label: "Analitik", desc: "Pola keuangan & skor finansial", icon: BarChart3 },
    { id: "budget", label: "Budget", desc: "Batas pengeluaran per kategori", icon: PieChart },
    { id: "tujuan", label: "Tujuan Keuangan", desc: "Target tabungan impian", icon: Target },
    { id: "kalender", label: "Kalender", desc: "Arus kas harian terjadwal", icon: CalendarDays },
    { id: "insight", label: "Insight AI", desc: "Rekomendasi kecerdasan buatan", icon: Sparkles },
  ];

  const matchedNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const matchedTx = transactions
    .filter((tx) =>
      tx.title.toLowerCase().includes(query.toLowerCase()) ||
      tx.category.toLowerCase().includes(query.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 5);

  const matchedGoals = goals.filter((g) =>
    g.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectNav = (pageId) => {
    setActivePage(pageId);
    setIsSearchModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
        onClick={() => setIsSearchModalOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#091524]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.12] shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari menu, transaksi, kategori, atau target... (Esc untuk batal)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 dark:text-white text-sm sm:text-base focus:outline-none placeholder:text-slate-400"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Menu navigation */}
          {matchedNav.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5">
                Halaman & Menu
              </p>
              <div className="space-y-1">
                {matchedNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectNav(item.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Transactions */}
          {matchedTx.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5">
                Transaksi ({matchedTx.length})
              </p>
              <div className="space-y-1">
                {matchedTx.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => handleSelectNav("transaksi")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          tx.type === "income"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300">
                          {tx.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {tx.category} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold font-display ${
                        tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"} {formatRupiah(tx.amount)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Goals */}
          {matchedGoals.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5">
                Tujuan Keuangan
              </p>
              <div className="space-y-1">
                {matchedGoals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectNav("tujuan")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300">
                          {g.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatRupiah(g.current)} / {formatRupiah(g.target)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-300">
                      {Math.round((g.current / g.target) * 100)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedNav.length === 0 && matchedTx.length === 0 && matchedGoals.length === 0 && (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              Tidak ada hasil yang cocok dengan "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#050C16]/80 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Navigasi instan FINORA</span>
          <div className="flex items-center gap-2">
            <span>Esc untuk tutup</span>
            <span>•</span>
            <span>↵ untuk pilih</span>
          </div>
        </div>
      </div>
    </div>
  );
};
