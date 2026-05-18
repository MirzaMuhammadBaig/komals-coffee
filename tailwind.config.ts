import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fbf6ef",
          100: "#f5e9d6",
          200: "#ecd5b3",
          300: "#dcba83",
        },
        espresso: {
          50: "#f4ece4",
          100: "#e2cdb4",
          200: "#c39a7e",
          300: "#9c6f53",
          400: "#704a32",
          500: "#503321",
          600: "#3a2417",
          700: "#28180f",
          800: "#1b1009",
          900: "#100905",
        },
        caramel: {
          400: "#e0a364",
          500: "#c98344",
          600: "#a3622a",
          700: "#7e491c",
        },
        blush: {
          200: "#f3d7cf",
          300: "#e9b7ab",
          400: "#d68f7d",
          500: "#b86a55",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
        script: ["var(--font-dancing)", "cursive"],
      },
      backgroundImage: {
        "hero-grain":
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 50%), radial-gradient(circle at 80% 70%, rgba(224,163,100,0.10), transparent 50%)",
        "warm-glow":
          "radial-gradient(ellipse at center, rgba(224,163,100,0.18), transparent 65%)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 1s ease-out forwards",
        "marquee": "marquee 30s linear infinite",
        "steam": "steam 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "kenburns": "kenburns 22s ease-in-out infinite alternate",
        "blob": "blob 14s ease-in-out infinite alternate",
        "wiggle": "wiggle 0.6s ease-in-out",
        "pulse-soft": "pulseSoft 2.6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        steam: {
          "0%, 100%": { opacity: "0.4", transform: "translateY(0) scale(1)" },
          "50%": { opacity: "0.8", transform: "translateY(-10px) scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        kenburns: {
          "0%": { transform: "scale(1) translate(0,0)" },
          "100%": { transform: "scale(1.12) translate(-1%,-2%)" },
        },
        blob: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(20px,-30px) scale(1.05)" },
          "100%": { transform: "translate(-20px,20px) scale(0.95)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(0)" },
          "25%": { transform: "rotate(-6deg)" },
          "75%": { transform: "rotate(6deg)" },
        },
        pulseSoft: {
          "0%,100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.92" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
