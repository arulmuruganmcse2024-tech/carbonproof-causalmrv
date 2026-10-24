/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        carbon: {
          950: "#040709",
          900: "#080e14",
          850: "#0c151f",
          800: "#111f2d",
          700: "#1a2f44",
          600: "#24425e",
        },
        forest: {
          900: "#06231a",
          800: "#093829",
          700: "#0d523c",
          600: "#127052",
          500: "#10b981",
          400: "#34d399",
          300: "#6ee7b7",
        },
        causal: {
          500: "#0ea5e9",
          400: "#38bdf8",
          300: "#7dd3fc",
        },
        pdd: {
          500: "#f43f5e",
          400: "#fb7185",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "Fira Code", "Courier New", "monospace"],
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
