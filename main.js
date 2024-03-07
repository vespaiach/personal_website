const fs = require('fs')
const matter = require('gray-matter')

const taskConveyor = [
  require('./tasks/getRaw'),
  require('./tasks/getMatter'),
  require('./tasks/getHtml'),
  function (item) {
    console.log(item)
  }
]

const putOnConveyor = (fileName) => {
  taskConveyor.reduce((item, task) => task(item), { fileName })
}

fs.readdirSync('./docs').forEach(putOnConveyor)
