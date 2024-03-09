const matter = require('gray-matter')

module.exports = async function (item) {
  const zx = await import('zx')
  const rawData = zx.fs.readFileSync(`./docs/${item.fileName}.md`, 'utf8')

  const { data, content } = matter(rawData)
  item.frontMatter = data
  item.markdown = content
}
