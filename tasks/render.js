const ejs = require('ejs')

module.exports = async function (item, next) {
  const zx = await import('zx')
  const layout = await zx.fs.readFile(`./layouts/post.ejs`, 'utf8')

  item.html = ejs.render(layout, item)
}
