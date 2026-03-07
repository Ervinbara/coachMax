/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2F80ED",
          deep: "#256FDB",
          light: "#EAF3FF",
          success: "#27C281",
          successLight: "#EAFBF3",
          warning: "#F4A340",
          warningLight: "#FFF4E8",
          text: "#1F2A44",
          textSecondary: "#6B7A99",
          muted: "#94A3B8",
          border: "#E8EEF5",
          page: "#F4F7FB",
          card: "#FFFFFF",
        },
      },
      borderRadius: {
        card: "22px",
      },
    },
  },
  plugins: [],
};
