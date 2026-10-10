import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { formatRupiah } from "../../utils/formatters";
import { GlassCard } from "../common/GlassCard";
import {
  Target,
  Laptop,
  Plane,
  ShieldCheck,
  Plus,
  Clock,
  X,
} from "lucide-react";

export const GoalsPage = () => {
  const { goals, addGoal, depositToGoal } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [estimateText, setEstimateText] = useState("6 bulan lagi");

  const getGoalIcon = (iconName) => {
    switch (iconName) {
      case "Laptop":
        return <Laptop className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case "Plane":
        return <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    }
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalTitle || !targetAmount) return;

    addGoal({
      title: goalTitle,
      category: "Target",
      current: Number(currentAmount || 0),
      target: Number(targetAmount),
      deadline: deadlineDate || "2027",
      estimate: estimateText || "6 bulan lagi",
      icon: "Target",
      color: "#14B8A6",
    });

    setGoalTitle("");
    setTargetAmount("");
    setCurrentAmount("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Tujuan Keuangan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Wujudkan impian finansial dengan rencana terukur.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Tujuan</span>
        </button>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.length === 0 ? (
          <GlassCard className="p-8 sm:p-12 text-center col-span-full">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Belum Ada Target Menabung
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">
              Mulai buat target impian pertamamu, seperti laptop, liburan, atau dana darurat.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Target Baru</span>
            </button>
          </GlassCard>
        ) : (
          goals.map((goal) => {
            const percentage = Math.min(100, Math.round(((goal.current || 0) / (goal.target || 1)) * 100));
            const remaining = Math.max(0, (goal.target || 0) - (goal.current || 0));

            return (
              <GlassCard
                key={goal.id}
                className="p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/50 dark:hover:border-white/[0.16] group"
              >
              <div>
                {/* Header: Icon & Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center shadow-xs">
                      {getGoalIcon(goal.icon)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-display group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                        {goal.title}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        {goal.estimate}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-extrabold text-teal-700 dark:text-teal-300 font-display px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20">
                    {percentage}%
                  </span>
                </div>

                {/* Amount Details */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Terkumpul:</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                      {formatRupiah(goal.current)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Target total:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {formatRupiah(goal.target)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <span>Sisa: <strong className="text-slate-800 dark:text-slate-200">{formatRupiah(remaining)}</strong></span>
                  <span>Tenggat: <strong className="text-slate-700 dark:text-slate-300">{goal.deadline}</strong></span>
                </div>
              </div>

              {/* Quick Deposit Actions */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center gap-2">
                <button
                  onClick={() => depositToGoal(goal.id, 100000)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-teal-500/20 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-white/[0.06] hover:border-teal-300 dark:hover:border-teal-400/40 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                >
                  + Rp 100 rb
                </button>
                <button
                  onClick={() => depositToGoal(goal.id, 500000)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/15 dark:hover:bg-teal-500/25 border border-teal-200 dark:border-teal-400/30 text-xs font-semibold text-teal-700 dark:text-teal-300 transition-all active:scale-95 shadow-2xs"
                >
                  + Rp 500 rb
                </button>
              </div>
            </GlassCard>
          );
        })
      )}
      </div>

      {/* Modal Tambah Tujuan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B1829] border border-slate-200 dark:border-white/[0.12] p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Tambah Tujuan Keuangan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Target
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kursus AI, Tabungan Umroh"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 10000000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Terkumpul Sekarang (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tenggat (Bulan/Tahun)
                  </label>
                  <input
                    type="text"
                    placeholder="Desember 2026"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Estimasi Selesai
                  </label>
                  <input
                    type="text"
                    placeholder="3 bulan lagi"
                    value={estimateText}
                    onChange={(e) => setEstimateText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 focus:bg-white dark:focus:bg-[#071322] text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-sm shadow-md"
              >
                Simpan Target
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
