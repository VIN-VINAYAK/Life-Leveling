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
          50: '#f2eaff',
          100: '#dfcaff',
          500: '#8b3dff',
          600: '#7424ed',
          700: '#b579ff'
        },
        accent: {
          400: '#c25cff',
          500: '#a23cff',
          600: '#7b25d8'
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
