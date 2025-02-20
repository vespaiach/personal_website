import fs from 'node:fs';
import path from 'node:path';

const layoutDirectoryPath = path.resolve(import.meta.dirname, '..', 'layouts');

export const getIndexLayout = async () => {
  const indexPage = path.resolve(layoutDirectoryPath, 'index.html');
  return await fs.promises.readFile(indexPage, 'utf-8');
}

export const getPostLayout = async () => {
  const postPage = path.resolve(layoutDirectoryPath, 'post.html');
  return await fs.promises.readFile(postPage, 'utf-8');
}
