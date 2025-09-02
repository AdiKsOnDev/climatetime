/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        climate: {
          blue: '#1E40AF',
          green: '#059669',
          orange: '#EA580C',
          red: '#DC2626'
        }
      }
    },
  },
  plugins: [],
}