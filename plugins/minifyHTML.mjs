import through from 'through2';
import minifyHtml from '@minify-html/node';
import PluginError from 'plugin-error';
import Vinyl from 'vinyl';

export default function minify() {
  return through.obj(function minifyHTML(file, encoding, callback) {
    try {
      if (Vinyl.isVinyl(file)) {
        const minified = minifyHtml.minify(file.contents, {
          keep_spaces_between_attributes: true,
          keep_comments: true,
        });
        file.contents = minified;
        callback(null, file);
      } else if (typeof file === 'string') {
        const minified = minifyHtml.minify(Buffer.from(file), {
          keep_spaces_between_attributes: true,
          keep_comments: true,
        });
        callback(null, minified);
      } else {
        callback(null, file);
      }
    } catch (error) {
      return callback(new PluginError('gulp-pug', error));
    }
  });
}
