const { parse } = require('marked')
const { format } = require('date-fns')

module.exports = async function (item) {
  item.content = await parse(item.markdown)
  item.frontMatter.date = format(new Date(item.frontMatter.date), 'MMMM dd, yyyy')
}
