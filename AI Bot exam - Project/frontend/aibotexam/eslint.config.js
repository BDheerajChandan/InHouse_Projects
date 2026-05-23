/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef9ff",
          100: "#d9f1ff",
          200: "#bce8ff",
          300: "#8ddaff",
          400: "#57c3ff",
          500: "#30a8ff",
          600: "#1a8bf5",
          700: "#1370de",
          800: "#175ab4",
          900: "#194e8e",
          950: "#143060",
        },
        accent: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        surface: {
          900: "#050b1a",
          800: "#091224",
          700: "#0e1c35",
          600: "#152543",
          500: "#1d3158",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "wave": "wave 1.5s linear infinite",
        "scan": "scan 2s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(30,139,245,0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(30,139,245,0.8), 0 0 60px rgba(30,139,245,0.3)" },
        },
        wave: {
          "0%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
          "100%": { transform: "scaleY(0.3)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(30,139,245,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(30,139,245,0.05) 1px, transparent 1px)",
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(30,139,245,0.3), transparent)",
      },
    },
  },
  plugins: [],
};