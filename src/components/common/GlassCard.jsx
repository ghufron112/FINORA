import React from "react";

export const GlassCard = ({
  children,
  className = "",
  variant = "default",
  hoverEffect = false,
  glow = false,
  onClick,
  ...props
}) => {
  const baseClasses = "relative rounded-[22px] backdrop-blur-xl transition-all duration-300";

  const variantClasses = {
    default:
      "bg-white/90 dark:bg-[#0F1D30]/75 border border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.5)]",
    solid:
      "bg-white dark:bg-[#0B1726]/90 border border-slate-200 dark:border-white/[0.08] shadow-md dark:shadow-2xl",
    teal:
      "bg-gradient-to-br from-teal-50/90 to-emerald-50/70 dark:from-[#0F1D30]/85 dark:to-[#0D2B3E]/80 border border-teal-200/90 dark:border-teal-500/25 shadow-sm dark:shadow-[0_12px_40px_-10px_rgba(94,234,212,0.12)]",
    blue:
      "bg-gradient-to-br from-blue-50/90 to-indigo-50/70 dark:from-[#0F1D30]/85 dark:to-[#11244A]/80 border border-blue-200/90 dark:border-blue-500/25 shadow-sm dark:shadow-[0_12px_40px_-10px_rgba(96,165,250,0.12)]",
    income:
      "bg-gradient-to-br from-emerald-50/90 to-teal-50/70 dark:from-[#0F1D30]/85 dark:to-[#0C2A24]/80 border border-emerald-200/90 dark:border-emerald-500/25 shadow-sm dark:shadow-[0_12px_40px_-10px_rgba(52,211,153,0.12)]",
    expense:
      "bg-gradient-to-br from-rose-50/90 to-pink-50/70 dark:from-[#0F1D30]/85 dark:to-[#331422]/80 border border-rose-200/90 dark:border-rose-500/25 shadow-sm dark:shadow-[0_12px_40px_-10px_rgba(251,113,133,0.12)]",
    warning:
      "bg-gradient-to-br from-amber-50/90 to-orange-50/70 dark:from-[#0F1D30]/85 dark:to-[#362612]/80 border border-amber-200/90 dark:border-amber-500/25 shadow-sm dark:shadow-[0_12px_40px_-10px_rgba(251,191,36,0.12)]",
    purple:
      "bg-gradient-to-br from-purple-50/90 to-violet-50/70 dark:from-[#0F1D30]/85 dark:to-[#24173D]/80 border border-purple-200/90 dark:border-purple-500/25 shadow-sm dark:shadow-[0_12px_40px_-10px_rgba(167,139,250,0.12)]",
  };

  const hoverClasses = hoverEffect
    ? "hover:-translate-y-1 hover:border-teal-400/50 dark:hover:border-white/[0.16] hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_44px_-10px_rgba(0,0,0,0.6)] cursor-pointer"
    : "";

  const glowElement = glow && (
    <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-400/20 dark:bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
  );

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${hoverClasses} ${className} overflow-hidden`}
      onClick={onClick}
      {...props}
    >
      {glowElement}
      {children}
    </div>
  );
};
