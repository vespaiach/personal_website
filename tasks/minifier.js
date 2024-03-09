const { minify } = require('html-minifier-terser')

module.exports = async function (item, next) {
  item.renderedPage = await minify(item.renderedPage, {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    removeComments: true
  })
  next()
}
