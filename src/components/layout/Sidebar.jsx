import React from "react";
import { useFinance } from "../../context/FinanceContext";
import { FinoraLogo } from "../common/FinoraLogo";
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  PieChart,
  Target,
  CalendarDays,
  Sparkles,
  Zap,
  ChevronRight,
  Database,
} from "lucide-react";

export const Sidebar = () => {
  const { activePage, setActivePage, user, setIsGasModalOpen, setIsAuthModalOpen, session } = useFinance();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transaksi", label: "Transaksi", icon: ReceiptText },
    { id: "analitik", label: "Analitik", icon: BarChart3 },
    { id: "budget", label: "Budget", icon: PieChart },
    { id: "tujuan", label: "Tujuan", icon: Target },
    { id: "kalender", label: "Kalender", icon: CalendarDays },
    { id: "insight", label: "Insight AI", icon: Sparkles, badge: "AI" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[268px] h-screen fixed left-0 top-0 z-40 bg-white/95 dark:bg-[#050B14]/80 backdrop-blur-2xl border-r border-slate-200/90 dark:border-white/[0.07] px-5 py-6 justify-between select-none transition-colors duration-200">
      {/* Top Branding */}
      <div>
        <div className="px-2 pt-1 pb-7 border-b border-slate-200/70 dark:border-white/[0.05]">
          <FinoraLogo showTagline={true} />
        </div>

        {/* Navigation Menu */}
        <div className="mt-6">
          <p className="px-3 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu Utama
          </p>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-gradient-to-r dark:from-teal-500/15 dark:via-teal-500/10 dark:to-transparent border border-teal-200/80 dark:border-teal-500/30 shadow-sm dark:shadow-[0_0_20px_-3px_rgba(94,234,212,0.18)]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-teal-500/15 text-teal-600 dark:bg-teal-400/20 dark:text-teal-300 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:bg-slate-200/50 dark:group-hover:bg-white/[0.05]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/15 dark:bg-gradient-to-r dark:from-teal-400/25 dark:to-blue-500/25 border border-teal-400/40 text-teal-600 dark:text-teal-300 animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {isActive && !item.badge && (
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 shadow-sm" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Area: Upgrade & Profile */}
      <div className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-white/[0.06]">
        {/* Sync Google Sheets / Upgrade Card */}
        <div className="relative rounded-2xl p-3.5 bg-gradient-to-br from-teal-50/90 via-sky-50/70 to-emerald-50/50 dark:from-[#0D243A]/90 dark:via-[#0B1B2D]/80 dark:to-[#081321] border border-teal-200/80 dark:border-teal-400/20 shadow-sm dark:shadow-lg group">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-teal-500/15 dark:bg-teal-400/20 flex items-center justify-center text-teal-600 dark:text-teal-300">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-white">Finora Pro Student</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            Database PostgreSQL Supabase & Keamanan RLS aktif.
          </p>
          <button
            onClick={() => setIsGasModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white dark:bg-teal-500/15 hover:bg-teal-50 dark:hover:bg-teal-500/25 border border-teal-200 dark:border-teal-400/30 text-teal-700 dark:text-teal-300 text-xs font-medium transition-all shadow-xs"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Supabase</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </button>
        </div>

        {/* User Profile Item */}
        <div
          onClick={() => {
            if (!session) setIsAuthModalOpen(true);
          }}
          className={`flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] ${
            !session ? "cursor-pointer hover:border-teal-400/40" : ""
          }`}
          title={!session ? "Klik untuk Masuk / Daftar Akun" : "Akun Aktif"}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                alt={user?.name || "User"}
                className="w-9 h-9 rounded-xl object-cover border border-teal-500/30"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#050B14] ${
                  session ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.role || (session ? "Pengguna" : "Tamu")}
              </p>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!session) setIsAuthModalOpen(true);
              else setActivePage("dashboard");
            }}
            title={session ? "Online" : "Klik untuk Masuk"}
            className={`w-2 h-2 rounded-full mr-1 ${session ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}
          />
        </div>
      </div>
    </aside>
  );
};
