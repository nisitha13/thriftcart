/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e4deff',
          300: '#d1c4ff',
          400: '#b79eff',
          500: '#9d74ff',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
        },
        lavender: {
          50: '#faf9ff',
          100: '#f4f1ff',
          200: '#ebe5ff',
          300: '#ddd0ff',
          400: '#c9b0ff',
          500: '#b591ff',
          600: '#a070ff',
          700: '#8b4eff',
          800: '#7c3aed',
          900: '#6d28d9',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};