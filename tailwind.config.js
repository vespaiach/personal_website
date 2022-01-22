module.exports = {
  content: ['./pages/**/*.tsx', './components/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        red: {
          900: '#f55e61ff',
        },
        slate: {
          900: '#5e696c',
        },
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
      },
    },
  },
};
