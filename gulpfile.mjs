import gulp from 'gulp';
import rename from 'gulp-rename';
import transform from './plugins/transform.mjs';
import gulpPug from './plugins/gulpPug.mjs';

const { src, dest } = gulp;

gulp.task('build', () => {
    return src('docs/*.md')
        .pipe(transform())
        .pipe(gulpPug('layouts/default.pug', { locals: { title: 'Hello World' } }))
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('build/', { overwrite: true }));
});
