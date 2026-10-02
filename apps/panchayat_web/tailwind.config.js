/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        panchayat: {
          green: '#1b5e20',
          lightGreen: '#e8f5e9',
          gold: '#c28e20'
        }
      }
    },
  },
  plugins: [],
};
