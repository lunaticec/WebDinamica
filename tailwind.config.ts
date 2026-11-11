import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060a",
          900: "#0a0c14",
          800: "#11141f",
          700: "#1a1e2d",
        },
        neon: {
          violet: "#8b5cf6",
          cyan: "#22d3ee",
          pink: "#f472b6",
          lime: "#a3e635",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 9vw, 9.5rem)", { lineHeight: "0.92", letterSpacing: "-0.045em" }],
        "display-lg": ["clamp(2.5rem, 6vw, 5.5rem)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
