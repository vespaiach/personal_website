const matter = require('gray-matter')

module.exports = function (item) {
  const { data, content } = matter(item.raw)
  item.matter = data
  item.markdown = content
  return item
}