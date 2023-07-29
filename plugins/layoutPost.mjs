import through from 'through2';
import pugEngine from 'pug';
import PluginError from 'plugin-error';
import Vinyl from 'vinyl';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cache = new Map();

function _readPugLayout(layoutPath) {
  if (!cache.has(layoutPath)) {
    cache.set(layoutPath, pugEngine.compileFile(layoutPath));
  }
  return cache.get(layoutPath);
}

function _readDirectory(name) {
  const pathToDir = path.join(__dirname, '../build', name);
  return fs.readdirSync(pathToDir);
}

export default function layoutPost() {
  return through.obj(function compilePug(file, encoding, callback) {
    if (!Vinyl.isVinyl(file)) {
      callback(new Error('Must be a Vinyl object'));
      return;
    }

    // If the file is null or a directory, do nothing
    if (file.isNull() || file.isDirectory()) {
      return callback(null, file);
    }

    // If the file is a buffer
    if (file.isBuffer()) {
      try {
        const compiler = _readPugLayout('layouts/post.pug');
        file.contents = Buffer.from(
          compiler({
            content: file.contents.toString(),
            frontmatter: file.frontmatter,
            links: _readDirectory('css').filter((file) => file.startsWith('post-')).map((file) => `/css/${file}`),
            scripts: _readDirectory('js').filter((file) => file.startsWith('post-')).map((file) => `/js/${file}`),
          }),
        );
      } catch (error) {
        return callback(new PluginError('gulp-pug', error));
      }
    }

    return callback(null, file);
  });
}
