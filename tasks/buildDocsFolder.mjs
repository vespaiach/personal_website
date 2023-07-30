import gulp from 'gulp';
import rename from 'gulp-rename';
import transform from '../plugins/transformMarkdown.mjs';
import layoutPost from '../plugins/layoutPost.mjs';
import minify from '../plugins/minifyHTML.mjs';

const { src, dest } = gulp;

export default function buildDocsFolder(cb) {
  src('docs/*.md')
    .pipe(transform())
    .pipe(layoutPost())
    .pipe(minify())
    .pipe(rename({ extname: '.html' }))
    .pipe(dest('build/', { overwrite: true }))
    .on('finish', () => {
      cb();
    })
    .on('error', (err) => {
      cb(err);
    });
}
