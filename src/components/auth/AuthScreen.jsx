import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Target,
  Loader2,
} from "lucide-react";

export const AuthScreen = () => {
  const { signIn, signUp, resetPassword } = useFinance();
  const [tab, setTab] = useState("register"); // Default to "register" as requested by user ("di awal harus buat akun")
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (tab === "register") {
      if (password.length < 6) {
        setErrorMsg("Kata sandi harus minimal 6 karakter.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Konfirmasi kata sandi tidak cocok. Harap periksa kembali.");
        return;
      }
    }

    setLoading(true);

    try {
      if (tab === "register") {
        const result = await signUp(email, password, fullName);
        if (result?.session) {
          setSuccessMsg(`Selamat datang di Finora, ${fullName || "Pengguna"}! Membuka ruang finansial Anda...`);
        } else {
          setSuccessMsg("Akun berhasil dibuat! Silakan buka email Anda untuk konfirmasi atau masuk sekarang.");
        }
      } else if (tab === "login") {
        await signIn(email, password);
        setSuccessMsg("Berhasil masuk! Membuka ruang finansial Anda...");
      } else if (tab === "forgot") {
        await resetPassword(email);
        setSuccessMsg("Tautan pemulihan kata sandi telah dikirim ke email Anda. Periksa kotak masuk/spam.");
      }
    } catch (err) {
      let msg = err.message || "Terjadi kesalahan. Periksa koneksi internet Anda.";
      if (msg.includes("Email not confirmed")) {
        msg = "Email belum dikonfirmasi. Periksa kotak masuk atau folder spam email Anda.";
      } else if (msg.includes("Invalid login credentials")) {
        msg = "Email atau kata sandi salah. Silakan periksa kembali.";
      } else if (msg.includes("User already registered")) {
        msg = "Email ini sudah terdaftar! Silakan beralih ke tab 'Masuk'.";
      } else if (msg.includes("Password should be at least")) {
        msg = "Kata sandi terlalu pendek. Gunakan minimal 6 karakter.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050B14] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden selection:bg-teal-500/20 selection:text-teal-200">
      {/* Ambient background glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/[0.04] rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Brand Hero & Value Proposition (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold mb-6 backdrop-blur-md w-fit">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Finora Financial Intelligence</span>
            <span className="text-white/30">•</span>
            <span>Cloud Supabase 2026</span>
          </div>

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-xl shadow-teal-500/20">
              <div className="w-full h-full bg-[#071322] rounded-[14px] flex items-center justify-center">
                <span className="text-xl font-black bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
                  F
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">
                FINORA
              </h1>
              <p className="text-xs text-teal-400/80 font-medium tracking-wider uppercase">
                Smart Financial Companion
              </p>
            </div>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white font-display leading-tight mt-2 mb-4">
            Kelola Keuangan Pribadi Lebih <span className="bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">Cerdas & Presisi</span>.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-lg">
            Buat akun Finora Anda untuk mengamankan data transaksi, memantau alur kas bulanan, menyusun anggaran cerdas, dan mencapai target tabungan tanpa ribet.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Pencatatan Arus Kas & Analitik</h4>
                <p className="text-[11px] text-slate-400">Laporan pemasukan dan pengeluaran tersinkronisasi otomatis.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Target Tabungan & Anggaran</h4>
                <p className="text-[11px] text-slate-400">Pantau progres tabungan dan limit anggaran secara real-time.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Terproteksi Cloud PostgreSQL</h4>
                <p className="text-[11px] text-slate-400">Data Anda terisolasi dengan Row Level Security dan enkripsi penuh.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Auth Card */}
        <div className="w-full lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md rounded-3xl bg-[#091524]/90 backdrop-blur-2xl border border-white/[0.12] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top subtle glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Mobile Header Branding */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20">
                <div className="w-full h-full bg-[#071322] rounded-[14px] flex items-center justify-center">
                  <span className="text-lg font-black bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
                    F
                  </span>
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-extrabold text-white font-display">FINORA</h1>
                <p className="text-[10px] text-teal-400 uppercase tracking-wider font-semibold">
                  Smart Financial Companion
                </p>
              </div>
            </div>

            {/* Card Title */}
            <div className="text-center sm:text-left mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                {tab === "register"
                  ? "Buat Akun Finora Baru"
                  : tab === "login"
                  ? "Masuk ke Akun Anda"
                  : "Pemulihan Kata Sandi"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {tab === "register"
                  ? "Daftar gratis untuk mulai mencatat keuangan Anda sekarang."
                  : tab === "login"
                  ? "Masukkan email dan kata sandi Anda untuk melanjutkan."
                  : "Masukkan email yang terdaftar untuk menerima tautan reset."}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  tab === "register"
                    ? "bg-[#0E2038] text-teal-300 shadow-sm border border-teal-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Buat Akun
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  tab === "login"
                    ? "bg-[#0E2038] text-teal-300 shadow-sm border border-teal-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("forgot");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  tab === "forgot"
                    ? "bg-[#0E2038] text-teal-300 shadow-sm border border-teal-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Lupa Sandi
              </button>
            </div>

            {/* Alert Messages */}
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-emerald-300 text-xs animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name for Register */}
              {tab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ali Ghufron"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#071322] border border-white/[0.08] focus:border-teal-400 text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#071322] border border-white/[0.08] focus:border-teal-400 text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              {tab !== "forgot" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#071322] border border-white/[0.08] focus:border-teal-400 text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password for Register */}
              {tab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Ulangi kata sandi Anda"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#071322] border border-white/[0.08] focus:border-teal-400 text-white placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {tab === "register"
                        ? "Daftar Akun Baru & Masuk"
                        : tab === "login"
                        ? "Masuk Sekarang"
                        : "Kirim Tautan Reset Sandi"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick helper note */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
              <p className="text-[11px] text-slate-400">
                {tab === "register" ? (
                  <span>
                    Sudah memiliki akun?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("login")}
                      className="text-teal-400 hover:underline font-semibold"
                    >
                      Masuk di sini
                    </button>
                  </span>
                ) : (
                  <span>
                    Belum memiliki akun?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("register")}
                      className="text-teal-400 hover:underline font-semibold"
                    >
                      Daftar akun baru
                    </button>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
