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
        soft: '0 20px 45px -24px rgba(189,100,52,0.35)',
        card: '0 12px 28px -18px rgba(15, 23, 42, 0.35)',
        'elev-1': 'var(--elev-1)',
        'elev-2': 'var(--elev-2)',
        'elev-3': 'var(--elev-3)'
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
