const { parse, Renderer, Tokenizer } = require('marked')
const { format } = require('date-fns')

module.exports = async function (item) {
  const tokenizer = new Tokenizer()
  const originalPreRenderer = tokenizer.tag.bind(tokenizer)

  tokenizer.tag = function (...args) {
    console.log(arguments)
    return originalPreRenderer(...args)
  }
  item.content = await parse(item.markdown, { tokenizer });
  item.frontMatter.date = format(new Date(item.frontMatter.date), 'MMMM dd, yyyy')
}
