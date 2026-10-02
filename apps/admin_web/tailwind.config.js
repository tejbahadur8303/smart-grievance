/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: '#0b3b60',
          orange: '#e66518',
          green: '#1e7e34',
          gold: '#c28e20'
        }
      }
    },
  },
  plugins: [],
};
