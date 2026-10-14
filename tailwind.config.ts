import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFAF4',
          100: '#F8F4ED',
          200: '#F0E8D8',
        },
        burgundy: {
          50: '#F9EEF1',
          100: '#F0D0D8',
          200: '#D4899E',
          300: '#B85C79',
          400: '#943050',
          500: '#7B1D3A',
          600: '#5C1228',
          700: '#3E0A1B',
          800: '#200410',
          900: '#100208',
        },
        gold: {
          50: '#FDF9EE',
          100: '#F7EDCC',
          200: '#EDD998',
          300: '#E0C165',
          400: '#D4AA40',
          500: '#C9A84C',
          600: '#A8893C',
          700: '#856B2D',
          800: '#624E1F',
          900: '#3F3112',
        },
        charcoal: {
          50: '#F5F4F4',
          100: '#E8E6E6',
          200: '#D0CCCC',
          300: '#B0ABAB',
          400: '#8A8484',
          500: '#6B6560',
          600: '#524D48',
          700: '#3C3836',
          800: '#2C2C2C',
          900: '#1A1A1A',
        },
        cream: '#F8F4ED',
        sand: '#E8E3D9',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(44,44,44,0.08), 0 4px 12px rgba(44,44,44,0.06)',
        'card-hover': '0 4px 12px rgba(44,44,44,0.12), 0 12px 32px rgba(44,44,44,0.08)',
        'modal': '0 8px 32px rgba(44,44,44,0.18)',
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
