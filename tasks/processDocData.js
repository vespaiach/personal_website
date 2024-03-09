const { parse } = require('marked')

module.exports = async function (item) {
  item.content = await parse(item.markdown)
}
