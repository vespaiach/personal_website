import gulp from 'gulp';
import build from './tasks/build.mjs';
import dev from './tasks/dev.mjs';

gulp.task('build', build);
gulp.task('dev', dev);
