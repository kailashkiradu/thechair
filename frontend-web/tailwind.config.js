/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chair: {
          bg: 'rgb(var(--chair-bg) / <alpha-value>)',
          surface: 'rgb(var(--chair-surface) / <alpha-value>)',
          card: 'rgb(var(--chair-card) / <alpha-value>)',
          border: 'rgb(var(--chair-border) / <alpha-value>)',
          accent: 'rgb(var(--chair-accent) / <alpha-value>)',
          'accent-dark': 'rgb(var(--chair-accent-dark) / <alpha-value>)',
          muted: 'rgb(var(--chair-muted) / <alpha-value>)',
          text: 'rgb(var(--chair-text) / <alpha-value>)',
          'text-muted': 'rgb(var(--chair-text-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
