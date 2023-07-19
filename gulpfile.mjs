import gulp from 'gulp';
import build from './tasks/build.mjs';

const { src, dest, series } = gulp

gulp.task('build', build);
