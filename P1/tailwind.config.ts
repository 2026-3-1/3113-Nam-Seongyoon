import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Pretendard: ["Pretendard", "sans-serif"],
        Syne: ["Syne", "sans-serif"],
      },
      colors: {
        bg: "#0c0d0f",
        surface: "#141517",
        surface2: "#1c1e22",
        accent: "#4F8EF7",
        accent2: "#A78BFA",
        gold: "#F5C518",
        muted: "#7A7D85",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        cardIn: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease both",
        cardIn: "cardIn 0.5s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
