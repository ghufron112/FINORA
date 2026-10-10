import React from "react";

export const FinoraLogo = ({ size = "default", showTagline = false, className = "" }) => {
  const isSmall = size === "small";
  const isLarge = size === "large";

  const iconDimensions = isSmall ? "w-8 h-8" : isLarge ? "w-12 h-12" : "w-10 h-10";
  const titleSize = isSmall ? "text-lg" : isLarge ? "text-2xl" : "text-xl";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Abstract Leaf / Financial Wave Icon */}
      <div className={`relative ${iconDimensions} flex items-center justify-center shrink-0`}>
        {/* Glow behind icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-teal-400/30 rounded-2xl blur-[6px]" />
        
        {/* Modern Icon Container */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 dark:from-[#0D233A] dark:to-[#081524] border border-teal-300/60 dark:border-teal-400/30 flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 32 32" className="w-5/6 h-5/6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoWave" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            {/* Elegant organic financial leaf/surge wave */}
            <path
              d="M7 23C9 15 15 11 25 8C25 18 20 23 13 25C9 26 7.5 24.5 7 23Z"
              fill="url(#logoWave)"
              fillOpacity="0.9"
            />
            {/* Rising filament */}
            <path
              d="M8 23C13 20.5 17.5 16 23 9.5"
              stroke="#0D9488"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Future target dot */}
            <circle cx="23.5" cy="9" r="2.2" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-extrabold tracking-wider text-slate-900 dark:text-white ${titleSize}`}>
            FINORA
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wide font-medium">
            Better Money, Brighter Future
          </span>
        )}
      </div>
    </div>
  );
};
