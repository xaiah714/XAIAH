import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Primary: deep indigo/navy — focus, trust, calm concentration.
        // Used for structure (nav, headers, borders, default buttons).
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Accent: warm amber/gold — used sparingly, only for primary CTAs
        // and the dollar-value hook headline. Not for general UI chrome.
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        // Soft coral — approaching-deadline / suspicious-listing states.
        // Deliberately warmer and less alarming than a harsh red.
        coral: {
          50: "#fff1ee",
          100: "#ffe1da",
          200: "#ffc4b8",
          400: "#ff8a75",
          500: "#fb7161",
          600: "#e35b4c",
          700: "#c1483c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
