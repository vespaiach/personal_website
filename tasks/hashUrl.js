const crypto = require('crypto')
const path = require('path')

module.exports = async function (item, next) {
  const hash = crypto.createHash('md5')
  hash.update(item.renderedPage)
  const hashedRenderedPage = hash.digest('hex')

  item.url = `${path.parse(item.fileName).name}-${hashedRenderedPage}`

  next()
}
