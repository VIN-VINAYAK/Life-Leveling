/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ebff',
          500: '#4f7cff',
          600: '#325ef5',
          700: '#2648c7'
        },
        accent: {
          400: '#8b5cf6',
          500: '#7c3aed',
          600: '#6d28d9'
        }
      },
      boxShadow: {
        soft: '0 20px 45px -24px rgba(79,124,255,0.45)',
        card: '0 12px 28px -18px rgba(15, 23, 42, 0.35)'
      },
      borderRadius: {
        xl2: '1.125rem',
        '4xl': '2rem'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif']
      }
    }
  },
  plugins: []
};
