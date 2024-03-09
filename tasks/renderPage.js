const fs = require('fs')
const ejs = require('ejs')

module.exports = async function (item, next) {
  const layout = fs.readFileSync(`./layouts/post.ejs`, 'utf8')
  item.renderedPage = ejs.render(layout, item)
  next()
}
