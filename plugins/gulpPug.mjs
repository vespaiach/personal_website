import through from 'through2';
import pug from 'pug';
import PluginError from 'plugin-error';
import Vinyl from 'vinyl';

const cache = new Map();

function readPugLayout(layoutPath) {
    if (!cache.has(layoutPath)) {
        cache.set(layoutPath, pug.compileFile(layoutPath));
    }
    return cache.get(layoutPath);
}

export default function gulpPug(layoutPath, options) {
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
                const data = Object.assign({}, options, { content: file.contents.toString() });
                const compiler = readPugLayout(layoutPath);
                file.contents = Buffer.from(compiler(data));
            } catch (error) {
                return callback(new PluginError('gulp-pug', error));
            }
        }

        return callback(null, file);
    });
}
