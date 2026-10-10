import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  X,
  TrendingUp,
  TrendingDown,
  Check,
} from "lucide-react";

export const AddTransactionModal = () => {
  const { isAddTxModalOpen, setIsAddTxModalOpen, addTransaction } = useFinance();

  const [type, setType] = useState("expense"); // "expense" | "income"
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Makanan");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddTxModalOpen) return null;

  const expenseCategories = [
    "Makanan",
    "Transportasi",
    "Belanja",
    "Tagihan",
    "Hiburan",
    "Pendidikan",
    "Lainnya",
  ];

  const incomeCategories = ["Gaji", "Freelance", "Hadiah", "Investasi", "Lainnya"];

  const currentCategories = type === "expense" ? expenseCategories : incomeCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      setIsSubmitting(true);
      await addTransaction({
        type,
        title,
        amount: Number(amount),
        category,
        date,
        paymentMethod,
        note,
      });

      // Reset & close
      setTitle("");
      setAmount("");
      setNote("");
      setIsAddTxModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity"
        onClick={() => setIsAddTxModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B1829]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.12] p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Subtle ambient light */}
        <div
          className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 ${
            type === "income" ? "bg-emerald-400" : "bg-rose-400"
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08] mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Tambah Transaksi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Catat mutasi keuangan harianmu dengan cepat
            </p>
          </div>
          <button
            onClick={() => setIsAddTxModalOpen(false)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle: Pemasukan / Pengeluaran */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] mb-5">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setCategory("Makanan");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              type === "expense"
                ? "bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategory("Pemasukan");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              type === "income"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Pemasukan</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul Transaksi */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Judul / Keperluan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Makan Siang, Gaji Bulanan, Kopi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] focus:outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-400 transition-colors"
            />
          </div>

          {/* Nominal (Rupiah) & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nominal (Rp)
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] focus:outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] focus:outline-none text-slate-900 dark:text-white text-sm transition-colors"
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {currentCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    category === cat
                      ? "bg-teal-50 dark:bg-teal-500/20 border-teal-300 dark:border-teal-400/40 text-teal-700 dark:text-teal-300 font-semibold"
                      : "bg-slate-100 dark:bg-[#071322] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Metode Pembayaran: Cash, Transfer, E-Wallet */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Cash", "Transfer", "E-Wallet"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                    paymentMethod === method
                      ? "bg-blue-50 dark:bg-blue-500/20 border-blue-300 dark:border-blue-400/40 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs"
                      : "bg-slate-100 dark:bg-[#071322] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:text-slate-200"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Catatan kecil atau lokasi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] focus:outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-400 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-teal-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
