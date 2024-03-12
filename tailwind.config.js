module.exports = {
  content: ['./layouts/**/*.*'],
  theme: {
    colors: {
      primary: '#1A202C',
      secondary: '#2D3748',
      accent: '#38B2AC',
      background: '#EDF2F7',
      codebg: '#2D3748',
      white: '#ffffff',
      black: '#000000'
    },
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
      mono: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.primary'),
            a: {
              color: theme('colors.accent'),
              '&:hover': {
                color: theme('colors.accent')
              }
            },
            code: {
              'background-color': theme('colors.codebg'),
              color: theme('colors.white')
            },
            pre: {
              'background-color': theme('colors.codebg'),
              color: theme('colors.white')
            }
          }
        }
      })
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
