const fs = require('fs')

module.exports = function (item) {
  item.raw = fs.readFileSync(`./docs/${item.fileName}`, 'utf8')
  return item
}