import gulp from 'gulp';
import rename from 'gulp-rename';
import transform from '../plugins/transform.mjs';
import pug from '../plugins/pug.mjs';

const { src, dest } = gulp;

export default function build(callback) {
    src('docs/*.md')
        .pipe(transform())
        .pipe(pug())
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('build/', { overwrite: true }));

    callback();
}
