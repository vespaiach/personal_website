import { Transform } from 'stream';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';
import gfm from 'remark-gfm';
import gulp from 'gulp';
import through from 'through2';
import rename from 'gulp-rename';
import Vinyl from 'vinyl';
import PluginError from 'plugin-error';
import pug from 'pug';

const { src, dest } = gulp;
const cache = new Map();

function _readPugLayout(layoutPath) {
    if (!cache.has(layoutPath)) {
        cache.set(layoutPath, pug.compileFile(layoutPath));
    }
    return cache.get(layoutPath);
}

function transformPlugin() {
    // Monkey patch Transform or create your own subclass,
    // implementing `_transform()` and optionally `_flush()`
    const transformStream = new Transform({ objectMode: true });
    transformStream._transform = function (file, encoding, callback) {
        const content = file.contents.toString();
        const matterResult = matter(content);
        remark()
            .use(html, { sanitize: false })
            .use(gfm)
            .use(prism)
            .process(matterResult.content)
            .then((processedContent) => {
                file.contents = Buffer.from(processedContent.value);
                file.frontmatter = matterResult.data;
                callback(null, file);
            });
    };

    return transformStream;
}

function pugLayoutPlugin() {
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
                    compiler({ content: file.contents.toString(), title: file.frontmatter.title }),
                );
            } catch (error) {
                return callback(new PluginError('gulp-pug', error));
            }
        }

        return callback(null, file);
    });
}

export default function build(callback) {
    src('docs/*.md')
        .pipe(transformPlugin())
        .pipe(pugLayoutPlugin())
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('build/', { overwrite: true }));

    callback();
}
