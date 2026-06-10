/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chair: {
          bg: '#0a0a0a',
          surface: '#141414',
          card: '#1e1e1e',
          border: '#2a2a2a',
          accent: '#f59e0b',
          'accent-dark': '#d97706',
          muted: '#525252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
