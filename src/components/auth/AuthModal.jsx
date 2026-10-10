import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { X, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, signIn, signUp, resetPassword, session } = useFinance();
  const [tab, setTab] = useState("login"); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (tab === "login") {
        await signIn(email, password);
        setSuccessMsg("Berhasil masuk!");
        setTimeout(() => setIsAuthModalOpen(false), 200);
      } else if (tab === "register") {
        const result = await signUp(email, password, fullName);
        if (result?.session) {
          setSuccessMsg(`Selamat datang, ${fullName || "Pengguna"}! Berhasil masuk.`);
          setTimeout(() => setIsAuthModalOpen(false), 1200);
        } else {
          setSuccessMsg(
            "Akun berhasil dibuat! Silakan cek inbox/spam email Anda untuk verifikasi, atau buka tab 'Masuk' untuk login."
          );
        }
      } else if (tab === "forgot") {
        await resetPassword(email);
        setSuccessMsg("Tautan reset kata sandi telah dikirim ke email Anda.");
      }
    } catch (err) {
      let msg = err.message || "Terjadi kesalahan, periksa koneksi atau kredensial Anda.";
      if (msg.includes("Email not confirmed")) {
        msg = "Email belum dikonfirmasi! Buka email Anda dan klik tautan konfirmasi, atau matikan opsi 'Confirm email' di dashboard Supabase.";
      } else if (msg.includes("Invalid login credentials")) {
        msg = "Email atau kata sandi tidak cocok. Silakan periksa kembali.";
      } else if (msg.includes("rate limit")) {
        msg = "Batas pengiriman email Supabase tercapai. Silakan matikan 'Confirm email' di dashboard Supabase Auth.";
      } else if (msg.includes("User already registered")) {
        msg = "Email ini sudah terdaftar! Silakan klik tab 'Masuk' di atas.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-md"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#091524]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.12] p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                {tab === "login"
                  ? "Masuk ke FINORA"
                  : tab === "register"
                  ? "Daftar Akun Baru"
                  : "Pemulihan Akun"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supabase Auth & PostgreSQL Cloud
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] mb-5">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              tab === "login"
                ? "bg-white dark:bg-[#0E2038] text-teal-700 dark:text-teal-300 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              tab === "register"
                ? "bg-white dark:bg-[#0E2038] text-teal-700 dark:text-teal-300 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Daftar
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("forgot");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              tab === "forgot"
                ? "bg-white dark:bg-[#0E2038] text-teal-700 dark:text-teal-300 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Lupa Sandi
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="misal: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 text-slate-900 dark:text-white text-xs sm:text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 text-slate-900 dark:text-white text-xs sm:text-sm"
              />
            </div>
          </div>

          {tab !== "forgot" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 text-slate-900 dark:text-white text-xs sm:text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>
              {loading
                ? "Memproses..."
                : tab === "login"
                ? "Masuk Sekarang"
                : tab === "register"
                ? "Daftar Akun"
                : "Kirim Tautan Reset"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-4 text-[11px] text-center text-slate-500 dark:text-slate-400">
          Data Anda terlindungi oleh Row Level Security (RLS) PostgreSQL.
        </p>
      </div>
    </div>
  );
};
