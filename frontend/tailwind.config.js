/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
      },
      colors: {
        primary: "#00B4D8",
        secondary: "#0077B6",
        grayLight: "#D6D6D6",
        grayDark: "#656565",
      },
      fontFamily: {
        vazir: ["Vazirmatn Variable", "sans-serif"],
      },
    },
  },
  plugins: [],
};
