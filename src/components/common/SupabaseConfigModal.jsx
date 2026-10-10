import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Key,
  Globe,
} from "lucide-react";
import {
  supabase,
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  updateSupabaseCredentials,
} from "../../lib/supabase";

export const SupabaseConfigModal = () => {
  const { isDbModalOpen, setIsDbModalOpen, setIsAuthModalOpen, session, refreshData } = useFinance();
  const [url, setUrl] = useState(() => supabaseUrl || "");
  const [anonKey, setAnonKey] = useState(() => supabaseAnonKey || "");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { success: boolean, message: string }
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isDbModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!url || !anonKey) return;
    updateSupabaseCredentials(url, anonKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      if (!isSupabaseConfigured() && (!url || !anonKey)) {
        throw new Error("Kredensial Supabase URL dan Anon Key belum diisi.");
      }
      // Test querying the categories table
      const { data, error } = await supabase.from("categories").select("count").limit(1);
      if (error) throw error;
      setTestStatus({
        success: true,
        message: "Koneksi ke Supabase PostgreSQL berhasil! RLS & Tabel aktif.",
      });
      await refreshData();
    } catch (err) {
      setTestStatus({
        success: false,
        message: err.message || "Gagal menghubungi database. Pastikan migrasi SQL sudah dijalankan.",
      });
    } finally {
      setTesting(false);
    }
  };

  const sampleSqlSnippet = `-- Jalankan file migration di Supabase SQL Editor:
-- supabase/migrations/20261010_initial_schema.sql
-- Berisi tabel profiles, accounts, categories, transactions, budgets, savings_goals
-- Serta Row Level Security (RLS) dan Trigger Profil Otomatis.`;

  const handleCopySqlInfo = () => {
    navigator.clipboard.writeText("supabase/migrations/20261010_initial_schema.sql");
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
        onClick={() => setIsDbModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#091524]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.12] p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                Integrasi Database Supabase
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PostgreSQL Cloud & Row Level Security (RLS)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDbModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Card */}
        <div
          className={`p-4 rounded-2xl border mb-5 transition-all ${
            isConfigured
              ? "bg-teal-50/70 dark:bg-[#071322] border-teal-200 dark:border-teal-500/20"
              : "bg-amber-50/70 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                    Koneksi Supabase Siap
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Mode Lokal / Menunggu Kredensial
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                RLS Multi-User
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isConfigured
              ? "Finora terhubung ke Supabase. Data transaksi, anggaran, dan target tabungan disimpan di PostgreSQL secara terisolasi per pengguna."
              : "Kredensial belum disetel. Finora menggunakan penyimpanan lokal yang aman hingga Anda memasukkan Project URL & Anon Key."}
          </p>

          {/* Auth shortcut */}
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Status Pengguna:{" "}
              <strong className="text-slate-800 dark:text-white">
                {session ? session.user?.email : "Belum Masuk"}
              </strong>
            </span>
            <button
              onClick={() => {
                setIsDbModalOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              {session ? "Ganti Akun" : "Masuk / Registrasi →"}
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Project URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                required
                placeholder="https://your-project-id.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 text-slate-900 dark:text-white text-xs sm:text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              API Publishable Key (Anon Key)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 text-slate-900 dark:text-white text-xs sm:text-sm font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Dapat ditemukan di Supabase Dashboard: <strong>Project Settings → API</strong>.
            </p>
          </div>

          {/* Test Status Alert */}
          {testStatus && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-start gap-2 ${
                testStatus.success
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 text-rose-800 dark:text-rose-300"
              }`}
            >
              {testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              {saved ? "Tersimpan! ✓" : "Simpan Kredensial"}
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin text-teal-500" : ""}`} />
              <span>{testing ? "Menguji..." : "Tes Koneksi"}</span>
            </button>
          </div>
        </form>

        {/* Migration Helper */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Skrip SQL Migrasi (Tabel & RLS)
            </span>
            <button
              onClick={handleCopySqlInfo}
              className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedSql ? "Path Tersalin!" : "Salin Lokasi File SQL"}</span>
            </button>
          </div>
          <pre className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-24 no-scrollbar">
            {sampleSqlSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Aliased export for compatibility
export const GasConfigModal = SupabaseConfigModal;
