const fs = require('fs')
const rimraf = require('rimraf')
const compose = require('koa-compose')

const composer = compose([
  require('./tasks/getRawData'),
  require('./tasks/getFrontMatter'),
  require('./tasks/parseMarkdown'),
  require('./tasks/renderPage'),
  require('./tasks/minifier'),
  require('./tasks/hashUrl'),
  require('./tasks/saveToFile')
])

function putOnConveyor (fileName) { composer({ fileName }) }
function clearDirectory(directory) { rimraf.sync(directory); fs.mkdirSync(directory) }

// Call the function before triggering the build process
clearDirectory('./build')

fs.readdirSync('./docs').forEach(putOnConveyor)
