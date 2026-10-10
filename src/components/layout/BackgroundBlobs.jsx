import React from "react";

export const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Left Teal Ambient Blob */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full opacity-70 dark:opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(45, 212, 191, 0.16) 0%, rgba(45, 212, 191, 0.03) 60%, transparent 80%)",
          filter: "blur(75px)",
        }}
      />
      
      {/* Top Right Royal Blue Ambient Blob */}
      <div 
        className="absolute top-[5%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full opacity-60 dark:opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, rgba(96, 165, 250, 0.02) 65%, transparent 80%)",
          filter: "blur(85px)",
        }}
      />

      {/* Center Deep Purple Subtle Accent */}
      <div 
        className="absolute top-[45%] left-[25%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full opacity-40 dark:opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* Bottom Emerald Subtle Glow */}
      <div 
        className="absolute -bottom-[10%] right-[15%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full opacity-50 dark:opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(52, 211, 153, 0.14) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Subtle fine mesh grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.015] text-slate-900 dark:text-white"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
};
