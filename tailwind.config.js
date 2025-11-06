/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      colors: {
        'brand-dark': '#0a0f1f',
        'brand-light-dark': '#131a31',
        'brand-accent': '#d4af37',
        'brand-accent-hover': '#e7c45d',
        'brand-text': '#d1d5db',
        'brand-text-light': '#9ca3af',
      }
    },
  },
  plugins: [],
}