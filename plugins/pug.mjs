import through from 'through2';
import pugEngine from 'pug';
import PluginError from 'plugin-error';
import Vinyl from 'vinyl';

const cache = new Map();

function _readPugLayout(layoutPath) {
    if (!cache.has(layoutPath)) {
        cache.set(layoutPath, pugEngine.compileFile(layoutPath));
    }
    return cache.get(layoutPath);
}

export default function pug() {
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
                const compiler = _readPugLayout('layouts/default.pug');
                file.contents = Buffer.from(
                    compiler({ content: file.contents.toString(), frontmatter: file.frontmatter }),
                );
            } catch (error) {
                return callback(new PluginError('gulp-pug', error));
            }
        }

        return callback(null, file);
    });
}
