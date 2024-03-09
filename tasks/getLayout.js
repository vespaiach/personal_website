const fs = require('fs')

module.exports = function (item) {
  item.raw = fs.readFileSync(`./layouts/${item.matter.layout}`, 'utf8')
  return item
}