import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0a",
          900: "#111111",
          800: "#1a1a1a",
          700: "#262626",
        },
        gold: {
          50: "#fbf7e8",
          100: "#f6efd0",
          200: "#ecdfa1",
          300: "#e0c96b",
          400: "#d4b13f",
          500: "#c89a25",
          600: "#a37a1c",
          700: "#7d5b16",
        },
        emerald: {
          900: "#0b3d2e",
          800: "#0f4f3b",
          700: "#13624a",
          600: "#177858",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.08)",
        gold: "0 10px 40px -10px rgba(200, 154, 37, 0.45)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #d4b13f 0%, #f6efd0 50%, #c89a25 100%)",
        "dark-gradient":
          "linear-gradient(180deg, #0a0a0a 0%, #111111 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
