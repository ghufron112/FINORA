import React, { useState, useRef, useEffect } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  X,
  Camera,
  Trash2,
  Upload,
  User,
  Mail,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader2,
  ShieldCheck,
  RotateCcw,
  LogOut,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

export const ProfileModal = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    user,
    session,
    updateProfile,
    resetUserData,
    deleteAccount,
    signOut,
    setIsAuthModalOpen,
  } = useFinance();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "danger"
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [hasCustomAvatar, setHasCustomAvatar] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!session) {
      setName("User");
      setAvatarPreview("https://api.dicebear.com/7.x/avataaars/svg?seed=GuestFinora");
      setHasCustomAvatar(false);
      setIsChanged(false);
      setSuccessMsg("");
      setErrorMsg("");
      return;
    }
    if (user) {
      setName(user.name || "User");
      setAvatarPreview(user.avatar || null);
      setHasCustomAvatar(Boolean(user.hasCustomAvatar));
      setIsChanged(false);
      setSuccessMsg("");
      setErrorMsg("");
    }
  }, [user, session, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  // Compress image to optimized format (square, max 320x320)
  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("File yang dipilih harus berupa gambar (JPG, PNG, WebP)"));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        reject(new Error("Ukuran foto maksimal 10 MB"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 320;
          let width = img.width;
          let height = img.height;

          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          const canvas = document.createElement("canvas");
          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext("2d");

          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            maxSize,
            maxSize
          );

          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Gagal membaca file gambar"));
        img.src = readerEvent.target.result;
      };
      reader.onerror = () => reject(new Error("Gagal membuka file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg("");
      const optimizedDataUrl = await processImageFile(file);
      setAvatarPreview(optimizedDataUrl);
      setHasCustomAvatar(true);
      setIsChanged(true);
    } catch (err) {
      setErrorMsg(err.message || "Gagal memproses foto");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name || "User"
    )}&backgroundColor=0f766e,0d9488&textColor=ffffff`;
    setAvatarPreview(fallbackAvatar);
    setHasCustomAvatar(false);
    setIsChanged(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (!session) {
        setIsProfileModalOpen(false);
        setIsAuthModalOpen(true);
        return;
      }

      const trimmedName = name.trim() || "User";
      const finalAvatar = hasCustomAvatar ? avatarPreview : null;

      await updateProfile({
        fullName: trimmedName,
        avatarUrl: finalAvatar,
      });

      setSuccessMsg("Profil dan foto berhasil diperbarui!");
      setIsChanged(false);
      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Gagal memperbarui profil. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (
      !window.confirm(
        "PERINGATAN: Apakah Anda yakin ingin mereset seluruh data transaksi, anggaran, dan target tabungan Anda? Seluruh saldo akan kembali ke Rp 0. Akun Anda tetap aktif."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await resetUserData();
      setSuccessMsg("Seluruh data keuangan berhasil di-reset ke 0.");
      setTimeout(() => setIsProfileModalOpen(false), 1200);
    } catch (err) {
      setErrorMsg(err.message || "Gagal mereset data keuangan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "PERINGATAN AKUN PERMANEN: Apakah Anda benar-benar yakin ingin menghapus akun dan seluruh jejak keuangan Anda secara permanen dari server database? Tindakan ini tidak dapat dibatalkan!"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await deleteAccount();
      setIsProfileModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || "Gagal menghapus akun.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={() => setIsProfileModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#091524]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.12] p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                Menu Akun Finora
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pusat kelola profil, foto, dan preferensi akun Anda
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-white dark:bg-[#0E2038] text-teal-700 dark:text-teal-300 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Profil & Foto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("danger")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "danger"
                ? "bg-white dark:bg-[#0E2038] text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Keamanan & Akun
          </button>
        </div>

        {/* Alerts */}
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

        {/* Tab 1: Profil & Foto */}
        {activeTab === "profile" && (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center pt-1 pb-2">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-teal-500/40 shadow-xl bg-slate-100 dark:bg-slate-800">
                  <img
                    src={
                      avatarPreview ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        name || "User"
                      )}&backgroundColor=0f766e,0d9488&textColor=ffffff`
                    }
                    alt={name || "User"}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Pilih foto dari galeri"
                  className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg border-2 border-white dark:border-[#091524] transition-transform hover:scale-110 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Action buttons for Avatar */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih dari Galeri</span>
                </button>

                {hasCustomAvatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                Format: JPG, PNG, WebP (otomatis dioptimalkan)
              </p>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsChanged(true);
                  }}
                  placeholder="Nama Lengkap Anda"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-white/[0.08] focus:border-teal-500 text-slate-900 dark:text-white text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email Akun
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={session ? (user?.email || "user@finora.id") : "Belum Masuk Akun (Mode Tamu)"}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] text-slate-500 dark:text-slate-400 text-xs sm:text-sm cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || (!isChanged && !successMsg)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Keamanan & Manajemen Akun */}
        {activeTab === "danger" && (
          <div className="space-y-4">
            {/* Status Keamanan */}
            <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  Database Cloud Supabase Terproteksi
                </h4>
                <p className="text-[11px] text-teal-700 dark:text-teal-300/80 mt-0.5 leading-relaxed">
                  Data transaksi Anda tersimpan aman dan diisolasi dengan Row Level Security.
                </p>
              </div>
            </div>

            {/* Sesi / Keluar Akun */}
            {session ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">
                    Keluar dari Sesi Ini
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Data Anda tetap aman di cloud dan siap diakses kembali saat login.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    setIsProfileModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Mode Tamu Aktif
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
                    Masuk atau daftar akun Finora untuk sinkronisasi cloud permanen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Masuk Akun</span>
                </button>
              </div>
            )}

            {/* Zona Pengaturan Sensitif */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Zona Pengaturan Sensitif (Danger Zone)</span>
              </div>

              <div className="space-y-2.5">
                {/* Reset Data */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-500/5 border border-amber-200/80 dark:border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Reset Data Keuangan Saya
                    </p>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70 mt-0.5">
                      Hapus riwayat transaksi & anggaran, mulai kembali dari saldo Rp 0. Akun tetap ada.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleResetData}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shrink-0 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>

                {/* Hapus Akun */}
                <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-500/5 border border-rose-200/80 dark:border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      Hapus Akun Permanen
                    </p>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70 mt-0.5">
                      Hapus profil, login, dan seluruh riwayat data dari server database secara permanen.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleDeleteAccount}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Akun</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
