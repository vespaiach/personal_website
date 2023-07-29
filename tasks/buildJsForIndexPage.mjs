import gulp from 'gulp';
import concat from 'gulp-concat';
import hashToFilename from '../plugins/hashToFilename.mjs';
import minifyJs from '../plugins/minifyJs.mjs';

const { src } = gulp;

export default function buildJsForIndexPage(cb) {
  const names = ['public/js/prism.js', 'public/js/index.js'];
  src(names)
    .pipe(concat('index.js'))
    .pipe(minifyJs())
    .pipe(hashToFilename('js'))
    .pipe(gulp.dest('build/js', { overwrite: true }));
  cb();
}
