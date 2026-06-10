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
        background: "#080B14",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#00D4FF", // Electric Cyan
          emerald: "#00E676", // Personal Workspace Emerald
        },
        card: "rgba(255, 255, 255, 0.08)",
        border: "rgba(255, 255, 255, 0.12)",
        secondary: "#B4C0D3",
        warning: "#FFB300",
        error: "#FF5252",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "float-medium": "float 6s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-15px) scale(1.05)" },
        },
        glow: {
          "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.05)" },
        }
      },
    },
  },
  plugins: [],
}
