const chokidar = require('chokidar');

// Initialize watcher.
const watcher = chokidar.watch(['./docs'], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

const { buildDocPage } = require('./main');

// Add event listeners.
watcher
  .on('add', buildDocPage)
  .on('change', buildDocPage)