/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        secondary: '#06b6d4',
        accent: '#38bdf8',
        neutral: '#f3f4f6',
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          900: '#0f172a',
          950: '#020617',
        },
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(15, 23, 42, 0.08)',
        'soft-dark': '0 8px 30px rgba(2, 6, 23, 0.55)',
        'glass': '0 10px 35px rgba(15, 23, 42, 0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        250: '250ms',
      },
      zIndex: {
        60: '60',
        70: '70',
      },
    },
  },
  plugins: [],
};
