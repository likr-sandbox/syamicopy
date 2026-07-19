/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        shamiRed: '#8B2500', // 朱赤 (和風モダン)
        washiWhite: '#FDFBF7', // 和紙白
        nouaiBlue: '#1B3A4B' // 濃藍
      }
    }
  },
  plugins: []
};
