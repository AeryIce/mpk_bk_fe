/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // oranye lebih "matang" biar tidak terlalu neon
          orange: "#ea580c", // tailwind orange-600
          gold: "#d4af37",
        },
      },
      // radius custom (tetap pakai nama xl2 seperti punyamu)
      borderRadius: {
        xl2: "1rem",
      },
      boxShadow: {
        elev: "0 8px 24px rgba(0,0,0,.15)",
      },
    },
  },
  plugins: [],
};
