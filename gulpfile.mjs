import gulp from 'gulp';
// import build from './tasks/build.mjs';
// import dev from './tasks/dev.mjs';
// import list from './tasks/list.mjs';
import buildCssForIndexPage from './tasks/buildCssForIndexPage.mjs';
import buildCssForPostPage from './tasks/buildCssForPostPage.mjs';
import buildJsForIndexPage from './tasks/buildJsForIndexPage.mjs';
import buildJsForPostPage from './tasks/buildJsForPostPage.mjs';
import buildDocsFolder from './tasks/buildDocsFolder.mjs';
import buildIndexPage from './tasks/buildIndexPage.mjs';
import copyImages from './tasks/copyImages.mjs';

// gulp.task('build', build);
// gulp.task('dev', dev);
// gulp.task('list', list);
gulp.task('build-css-for-index-page', buildCssForIndexPage);
gulp.task('build-js-for-index-page', buildJsForIndexPage);
gulp.task('build-css-for-post-page', buildCssForPostPage);
gulp.task('build-js-for-post-page', buildJsForPostPage);
gulp.task('build-docs-folder', buildDocsFolder);
gulp.task('build-index-page', buildIndexPage);
gulp.task('copy-images', copyImages);

gulp.task(
  'build',
  gulp.series(
    'build-css-for-index-page',
    'build-js-for-index-page',
    'build-css-for-post-page',
    'build-js-for-post-page',
    gulp.parallel('build-docs-folder', 'build-index-page', 'copy-images'),
  ),
);
