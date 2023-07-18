import gulp from 'gulp';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import mdToHtml from './plugins/mdToHtml.mjs';
import layoutMerging from './plugins/layoutMerging.mjs';

const { src, dest, series } = gulp;

function html(cb) {
    src('docs/*.md')
        .pipe(mdToHtml())
        .pipe(layoutMerging('layouts/default.pug', { locals: { title: 'Hello World' } }))
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('build/', { overwrite: true }));

    cb();
}

function assets(cb) {
    src('public/**/*').pipe(dest('build/', { overwrite: true }));

    cb();
}

gulp.task('build', series(html, assets));
