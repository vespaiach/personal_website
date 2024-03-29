import gulp from 'gulp';
import concat from 'gulp-concat';
import cleanCSS from 'gulp-clean-css';
import hashToFilename from '../plugins/hashToFilename.mjs';

const { src } = gulp;

export default function buildCssForPostPage(cb) {
  const names = ['public/css/prism.css', 'public/css/base.css', 'public/css/post.css'];
  src(names)
    .pipe(concat('post.css'))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(hashToFilename('css'))
    .pipe(gulp.dest('build/css', { overwrite: true }))
    .on('finish', () => {
      cb();
    })
    .on('error', (err) => {
      cb(err);
    });
}
