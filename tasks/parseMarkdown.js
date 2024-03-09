const { parse } = require('marked')

module.exports = async function (item, next) {
  item.parsedMarkdown = parse(item.markdown)
  next()
}
