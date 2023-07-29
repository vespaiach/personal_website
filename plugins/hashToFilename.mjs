import through from 'through2';
import hasha from 'hasha';
import PluginError from 'plugin-error';
import Vinyl from 'vinyl';
import { Readable } from 'node:stream';
import path from 'node:path';

export default function hashToFilename(ext) {
  return through.obj(function compilePug(file, _, callback) {
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
      hasha
        .fromStream(Readable.from(file.contents), { algorithm: 'md5' })
        .then((hash) => {
          file.basename = `${path.parse(file.basename).name}-${hash}.${ext}`;
          callback(null, file);
        })
        .catch((error) => {
          callback(new PluginError('gulp-pug', error));
        });
    }
  });
}
