import React, { useState, useRef, useEffect } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  Search,
  Bell,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Camera,
  FileText,
} from "lucide-react";
import { FinoraLogo } from "../common/FinoraLogo";

export const Topbar = () => {
  const {
    user,
    notifications,
    markAllNotificationsRead,
    setIsAddTxModalOpen,
    setIsSearchModalOpen,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    setIsReportModalOpen,
    session,
    signOut,
    resetUserData,
    deleteAccount,
    activePage,
    setActivePage,
    theme,
    toggleTheme,
  } = useFinance();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-[70px] w-full bg-white/90 dark:bg-[#050B14]/85 backdrop-blur-xl border-b border-slate-200/90 dark:border-white/[0.06] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Mobile Logo (hidden on desktop) */}
      <div className="flex items-center gap-2 lg:hidden">
        <FinoraLogo size="small" />
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-xl mx-auto hidden sm:block">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-[#0F1D30]/60 hover:bg-slate-100 dark:hover:bg-[#0F1D30]/90 border border-slate-200/80 dark:border-white/[0.08] hover:border-teal-500/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all text-sm group"
        >
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
            <span className="truncate">Cari transaksi, kategori, atau tujuan...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-500 dark:text-slate-300 shadow-2xs">
              ⌘ K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Side: Theme Toggle, Quick Add, Notification, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="sm:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300"
          aria-label="Cari"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          className="p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-[#0F1D30]/70 hover:bg-slate-200 dark:hover:bg-[#142640] border border-slate-200/90 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-teal-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Quick Add Transaction Button */}
        <button
          onClick={() => setIsAddTxModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-teal-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">Catat Transaksi</span>
        </button>

        {/* Notification Icon & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (!isNotifOpen) markAllNotificationsRead();
            }}
            className="relative p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-[#0F1D30]/70 hover:bg-slate-200 dark:hover:bg-[#142640] border border-slate-200/90 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#050B14] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0D1B2D]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notifikasi Finora</h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-medium">
                    {notifications.length}
                  </span>
                </div>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  Tandai dibaca
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((notif) => {
                  const getIcon = () => {
                    if (notif.type === "warning")
                      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
                    if (notif.type === "success")
                      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                    return <Info className="w-4 h-4 text-blue-500" />;
                  };

                  return (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border transition-all text-left flex gap-3 ${
                        notif.read
                          ? "bg-slate-50 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/[0.04] text-slate-500 dark:text-slate-400"
                          : "bg-teal-50/80 dark:bg-teal-500/[0.06] border-teal-200/80 dark:border-teal-500/20 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{getIcon()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-[#0F1D30]/70 hover:bg-slate-200 dark:hover:bg-[#142640] border border-slate-200/90 dark:border-white/[0.08] transition-all group"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
              alt={user?.name || "Pengguna"}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl object-cover border border-teal-500/40"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                {user?.name || "Pengguna"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {user?.role || "Pengguna Finora"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white dark:bg-[#0D1B2D]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsProfileOpen(false);
                }}
                className="px-3 py-2.5 border-b border-slate-200/80 dark:border-white/[0.06] mb-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors group"
                title="Buka Menu Akun"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                    {user?.name || "Pengguna"}
                  </p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 flex items-center gap-1 font-medium shrink-0">
                    <User className="w-3 h-3" />
                    <span>Kelola</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || "Akun Terhubung"}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-medium text-teal-700 dark:text-teal-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Akun Finora Aktif
                </div>
              </div>

              <div className="space-y-0.5 text-xs text-slate-700 dark:text-slate-300">
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-teal-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">Menu Akun & Profil</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">Buka</span>
                </button>

                <button
                  onClick={() => {
                    setIsReportModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <FileText className="w-4 h-4 text-teal-500" />
                  <span>Unduh Laporan Keuangan</span>
                </button>

                <button
                  onClick={() => {
                    setActivePage("analitik");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Preferensi & Budget</span>
                </button>
              </div>

              <div className="pt-1.5 mt-1 border-t border-slate-200/80 dark:border-white/[0.06]">
                <button
                  onClick={async () => {
                    await signOut();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-xs font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
