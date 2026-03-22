/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arena-bg': '#050506',
        'arena-cyan': '#00F2FF',
      },
    },
  },
  plugins: [],
}
