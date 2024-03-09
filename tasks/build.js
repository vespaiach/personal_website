const { minify } = require('html-minifier-terser')
const getFileNameWithHash = require('../utils/getFileNameWithHash')

module.exports = async function (item, isProd) {
  const zx = await import('zx')

  if (isProd) {
    item.html = await minify(item.html, {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true
    })
  }

  item.url = isProd ? getFileNameWithHash(item.html, { prefix: `${item.fileName}.` }) : item.fileName

  zx.fs.writeFileSync(`./build/${item.url}.html`, item.html)

  console.log(zx.chalk.green(`Rendered ${item.url}.html`))
}
