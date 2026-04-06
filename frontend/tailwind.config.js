/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        raayaBlack: "#0B0B0B",
        raayaIvory: "#F5F5F0",
        raayaGold: "#C5A46D",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        luxe: "0 10px 40px rgba(0, 0, 0, 0.08)",
      },
      backgroundImage: {
        "raaya-glow": "radial-gradient(circle at top right, rgba(197,164,109,0.25), transparent 55%)",
      },
    },
  },
  plugins: [],
};
