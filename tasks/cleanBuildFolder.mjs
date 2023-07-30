import gulp from 'gulp';
import { deleteSync } from 'del';

const { dest, src } = gulp;

export default function cleanBuildFolder(cb) {
  deleteSync(['build/**']);
  src('.keep').pipe(dest('build/css/', { overwrite: true }));
  src('.keep').pipe(dest('build/js/', { overwrite: true }));
  src('.keep').pipe(dest('build/images', { overwrite: true }));

  cb();
}
