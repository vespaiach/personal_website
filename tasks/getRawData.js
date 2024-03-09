const fs = require('fs')

module.exports = async function (item, next) {
  fs.readFile(`./docs/${item.fileName}`, 'utf8', (err, data) => {
    if (err) throw err
    item.rawData = data
    next()
  })
}
