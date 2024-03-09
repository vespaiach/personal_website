const fs = require('fs')
const path = require('path')

module.exports = async function (item, next) {
  const newFilename = `./build/${path.format({ name: item.url, ext: '.html' })}`
  fs.writeFile(newFilename, item.renderedPage, (err) => {
    if (err) throw err
    console.log(`Saved to: ${newFilename}`)
    next()
  })
}
