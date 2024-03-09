const ejs = require('ejs')

module.exports = async function (item) {
  const zx = await import('zx')
  const layout = await zx.fs.readFile(`./layouts/${item.layout}.ejs`, 'utf8')

  item.html = ejs.render(layout, item)
}
