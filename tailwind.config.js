module.exports = {
    content: ['./pages/**/*.tsx', './components/**/*.tsx'],
    plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
    theme: {
        extend: {
            fontFamily: {
                inter: '"Inter", sans-serif;',
            },
            colors: {
                white: '#fcfcfc',
                cyan: {
                    600: '#20B5E9',
                },
                orange: {
                    100: '#f4a88d',
                    600: '#e95420',
                },
                gray: {
                    500: '#504f53',
                    200: '#a8a8a8',
                    800: '#636363',
                },
                slate: {
                    100: '#d7d7d7',
                },
                black: '#535256',
            },
        },
    },
};
