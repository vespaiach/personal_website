import gulp from 'gulp';

export default function copyImages(cb) {
  gulp
    .src('public/images/*')
    .pipe(gulp.dest('build/images/', { overwrite: true }))
    .on('finish', () => {
      cb();
    })
    .on('error', (err) => {
      cb(err);
    });
}
