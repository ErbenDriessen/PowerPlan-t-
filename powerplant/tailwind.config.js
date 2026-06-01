// powerplant/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito_400Regular"],
        semibold: ["Nunito_600SemiBold"],
        bold: ["Nunito_700Bold"],
        extrabold: ["Nunito_800ExtraBold"],
      },
      colors: {
        primary: "#7CB342",
        "primary-soft": "#9BCE5C",
        "primary-deep": "#6BA235",
        deep: "#2E5D3A",
        cream: "#FAF6E8",
        yellow: "#FFF4C2",
        mist: "#E8EFE3",
        bark: "#8B6F47",
        night: "#1B3A2F",
        "dusk-1": "#4A5C6E",
        "dusk-2": "#2D4356",
        "dusk-3": "#1B2E3F",
        "dusk-4": "#122538",
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.5rem" },
    },
  },
  plugins: [],
};
