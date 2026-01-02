/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // We will import 'Nunito' for that rounded, soft look
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        pastel: {
          bg: '#FDF6F0',      // Creamy background
          card: '#FFFFFF',    // White cards
          lavender: '#E6E6FA',
          rose: '#FFD1DC',
          blue: '#D0F0C0',    // Tea green/blue mix
          text: '#4A4A4A',    // Soft dark grey
        }
      }
    },
  },
  plugins: [],
}