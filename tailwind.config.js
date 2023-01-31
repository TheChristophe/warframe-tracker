/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        'inner-thicc': 'inset 0 0 8px rgb(0 0 0 / 0.4)',
      },
    },
  },
  plugins: [],
};
