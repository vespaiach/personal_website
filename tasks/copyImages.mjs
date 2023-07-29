import gulp from 'gulp';

export default function copyImages(callback) {
    gulp.src('public/images/*').pipe(gulp.dest('build/images/', { overwrite: true }));
    callback();
}
