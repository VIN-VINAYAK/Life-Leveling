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
          50: '#f4efe2',
          100: '#e7d3ad',
          500: '#a66028',
          600: '#7f3f26',
          700: '#bd6434'
        },
        accent: {
          400: '#d8a45b',
          500: '#a66028',
          600: '#7f3f26'
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
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif']
      }
    }
  },
  plugins: []
};
