/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'oracle-primary': '#4F46E5',
        'oracle-secondary': '#6B7280',
        'oracle-accent': '#10B981',
        'oracle-background': '#F9FAFB',
        'oracle-text': '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
} 