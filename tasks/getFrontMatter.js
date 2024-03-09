const matter = require('gray-matter')

module.exports = async function (item, next) {
  const { data, content } = matter(item.rawData)
  item.frontMatter = data
  item.markdown = content
  next()
}
