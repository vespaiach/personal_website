const crypto = require('crypto')

module.exports = function getFileNameWithHash(content, options = {}) {
  const opts = { algorithm: 'sha256', trim: 10, prefix: '', ...options }
  const hashkey = crypto.createHash(opts.algorithm).update(content).digest('hex').substring(0, opts.trim)
  return `${opts.prefix}${hashkey}`
}
