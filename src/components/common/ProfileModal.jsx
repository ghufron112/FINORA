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
} from "lucide-react";

export const ProfileModal = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    user,
    session,
    updateProfile,
    setIsAuthModalOpen,
  } = useFinance();

  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [hasCustomAvatar, setHasCustomAvatar] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarPreview(user.avatar || null);
      setHasCustomAvatar(Boolean(user.hasCustomAvatar));
      setIsChanged(false);
      setSuccessMsg("");
      setErrorMsg("");
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  // Compress image to optimized format (square, max 320x320)
  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("File yang dipilih harus berupa gambar (JPG, PNG, WebP)"));
        return;
      }

      // Max 10MB input check
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

          // Crop / scale to center square
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          const canvas = document.createElement("canvas");
          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext("2d");

          // Draw cropped & resized square
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

          // Output high quality JPEG
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={() => setIsProfileModalOpen(false)}
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
                Pengaturan Profil & Foto
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah nama dan foto profil Anda secara bebas
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

        <form onSubmit={handleSave} className="space-y-5">
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

              {/* Quick camera trigger button on avatar */}
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Akun
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                readOnly
                disabled
                value={user?.email || "user@finora.id"}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.05] text-slate-500 dark:text-slate-400 text-xs sm:text-sm cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Cloud Info Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.04] text-[11px] text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
            <span>
              {session
                ? "Tersinkronisasi otomatis dengan akun Supabase Cloud Anda."
                : "Masuk dengan akun Supabase agar foto tersimpan permanen di cloud."}
            </span>
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
      </div>
    </div>
  );
};
