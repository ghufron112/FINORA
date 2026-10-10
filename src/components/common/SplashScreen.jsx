import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

export const SplashScreen = ({ onFinish, duration = 1800 }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [statusText, setStatusText] = useState("Menyiapkan ruang finansial...");

  useEffect(() => {
    const startTime = Date.now();
    const intervalTime = 30; // 30ms step for silky smooth progress

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (currentProgress < 40) {
        setStatusText("Menyiapkan ruang finansial...");
      } else if (currentProgress < 80) {
        setStatusText("Sinkronisasi data & keamanan...");
      } else {
        setStatusText("Selamat datang di Finora ✨");
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        setIsFadingOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 350); // match transition duration
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050B14] text-white select-none transition-all duration-300 ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Brand Card */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-sm w-full">
        {/* Animated Brand Logo */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-3xl blur-xl opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#0F2236] to-[#081524] border border-teal-500/30 shadow-2xl flex items-center justify-center">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-teal-400 drop-shadow-[0_0_12px_rgba(45,212,191,0.5)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>

            {/* Sparkle badge */}
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-teal-400/20 border border-teal-300/40 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-spin" style={{ animationDuration: "6s" }} />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-teal-200 font-display">
          FINORA
        </h1>

        {/* Tagline */}
        <p className="mt-2 text-xs sm:text-sm text-slate-400 tracking-wide font-medium">
          Smart Personal Finance & Wealth Tracker
        </p>

        {/* Progress Bar Container */}
        <div className="w-full mt-8">
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.08] backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="truncate">{statusText}</span>
            <span className="font-mono text-teal-300 shrink-0 ml-2">{progress}%</span>
          </div>
        </div>

        {/* Security badge at bottom */}
        <div className="mt-10 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-500/80" />
          <span>PostgreSQL Cloud Encrypted</span>
        </div>
      </div>
    </div>
  );
};
