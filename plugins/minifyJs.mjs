import through from 'through2';
import PluginError from 'plugin-error';
import { minify } from 'terser';

export default function minifyJs() {
  return through.obj(function compilePug(file, _, callback) {
    minify(file.contents.toString())
      .then((minified) => {
        file.contents = Buffer.from(minified.code);
        callback(null, file);
      })
      .catch((error) => {
        callback(new PluginError('gulp-pug', error));
      });
  });
}
