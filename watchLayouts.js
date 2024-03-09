const chokidar = require('chokidar');

// Initialize watcher.
const watcher = chokidar.watch(['./layouts'], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

const build = async function () {
  const zx = await import('zx')
  await zx.$`node ./main.js`
}

// Add event listeners.
watcher
  .on('add', build)
  .on('change', build)