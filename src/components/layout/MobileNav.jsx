import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  PieChart,
  Menu,
  Target,
  CalendarDays,
  Sparkles,
  X,
  Database,
  Plus,
} from "lucide-react";

export const MobileNav = () => {
  const {
    activePage,
    setActivePage,
    setIsAddTxModalOpen,
    setIsGasModalOpen,
  } = useFinance();

  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  const mainNavItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "transaksi", label: "Transaksi", icon: ReceiptText },
    { id: "add", label: "Catat", isAction: true },
    { id: "analitik", label: "Analitik", icon: BarChart3 },
    { id: "menu", label: "Menu", icon: Menu, isMenuTrigger: true },
  ];

  const drawerItems = [
    { id: "budget", label: "Budget & Anggaran", icon: PieChart, desc: "Atur batas pengeluaran" },
    { id: "tujuan", label: "Tujuan Keuangan", icon: Target, desc: "Target tabungan impian" },
    { id: "kalender", label: "Kalender Transaksi", icon: CalendarDays, desc: "Arus kas harian" },
    { id: "insight", label: "Insight AI", icon: Sparkles, desc: "Rekomendasi kecerdasan buatan", badge: "AI" },
  ];

  return (
    <>
      {/* Mobile Drawer / Sheet */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuDrawerOpen(false)}
          />
          <div className="fixed bottom-0 inset-x-0 rounded-t-3xl bg-white dark:bg-[#091524] border-t border-slate-200 dark:border-white/[0.1] p-5 pb-8 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-base">Menu Lainnya</span>
                <span className="text-xs text-slate-400">FINORA</span>
              </div>
              <button
                onClick={() => setIsMenuDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 mb-5">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setIsMenuDrawerOpen(false);
                    }}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? "bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-400/30 text-teal-700 dark:text-teal-300"
                        : "bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-teal-500/10 dark:bg-white/[0.05] text-teal-600 dark:text-teal-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/15 dark:bg-teal-400/20 text-teal-700 dark:text-teal-300 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar for Mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#050B14]/90 backdrop-blur-2xl border-t border-slate-200/90 dark:border-white/[0.08] px-3 py-2 pb-safe transition-colors duration-200">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainNavItems.map((item) => {
            if (item.isAction) {
              return (
                <button
                  key="add-action"
                  onClick={() => setIsAddTxModalOpen(true)}
                  className="flex flex-col items-center justify-center -mt-6 group"
                  aria-label="Catat Transaksi"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 group-active:scale-95 transition-all">
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-300 mt-1">Catat</span>
                </button>
              );
            }

            if (item.isMenuTrigger) {
              const isOtherPageActive = ["budget", "tujuan", "kalender", "insight"].includes(activePage);
              return (
                <button
                  key="menu-trigger"
                  onClick={() => setIsMenuDrawerOpen(true)}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                    isOtherPageActive ? "text-teal-600 dark:text-teal-400 font-semibold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Menu className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Menu</span>
                </button>
              );
            }

            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
                  isActive
                    ? "text-teal-600 dark:text-teal-300 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500 dark:bg-teal-400 shadow-sm" />
                  )}
                </div>
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
