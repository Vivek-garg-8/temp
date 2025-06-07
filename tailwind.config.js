/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          background: 'rgb(var(--color-background) / <alpha-value>)',
          'background-secondary': 'rgb(var(--color-background-secondary) / <alpha-value>)',
          'background-tertiary': 'rgb(var(--color-background-tertiary) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
          'surface-secondary': 'rgb(var(--color-surface-secondary) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          'border-secondary': 'rgb(var(--color-border-secondary) / <alpha-value>)',
          'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
          'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
          'text-tertiary': 'rgb(var(--color-text-tertiary) / <alpha-value>)',
          'text-inverse': 'rgb(var(--color-text-inverse) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'gradient-theme': 'var(--gradient-background)',
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};