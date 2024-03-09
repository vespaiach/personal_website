const postcss = require('postcss')
const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')
const getFileNameWithHash = require('../utils/getFileNameWithHash')

module.exports = function (isProd) {
  let resolve, reject
  const promise = new Promise((...rest) => { [resolve, reject] = rest })

  import('zx').then((zx) => {
    const plugins = [tailwindcss, autoprefixer, isProd && require('cssnano')].filter(Boolean)

    const css = zx.fs.readFileSync('./css/main.css', 'utf8')

    postcss(plugins)
      .process(css, { from: './css/main.css', to: './build/main.css' })
      .then((result) => {
        const fileName = (isProd ? getFileNameWithHash(result.css, { prefix: 'main.' }) : 'main') + '.css'
        zx.fs.outputFileSync(`./build/${fileName}`, result.css)

        resolve(fileName)
      })
      .catch(reject)
  })
  
  return promise
}
