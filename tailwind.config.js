/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        finora: {
          bg: "#050B14",
          bgSecondary: "#081321",
          panel: "rgba(15, 29, 48, 0.75)",
          panelSolid: "#0D1B2D",
          panelHover: "rgba(22, 40, 65, 0.85)",
          border: "rgba(255, 255, 255, 0.08)",
          borderLight: "rgba(255, 255, 255, 0.14)",
          textPrimary: "#F5F7FA",
          textSecondary: "#94A3B8",
          textMuted: "#64748B",
          teal: "#5EEAD4",
          blue: "#60A5FA",
          income: "#34D399",
          expense: "#FB7185",
          warning: "#FBBF24",
          purple: "#A78BFA",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-teal': '0 0 25px -5px rgba(94, 234, 212, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(96, 165, 250, 0.3)',
        'glow-income': '0 0 25px -5px rgba(52, 211, 153, 0.3)',
        'glow-expense': '0 0 25px -5px rgba(251, 113, 133, 0.3)',
        'card-subtle': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
