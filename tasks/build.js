import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import _ from 'lodash';

import { getIndexLayout, getPostLayout } from './layout.js';
import { getListOfArticleMetadata, getArticleDetail } from './db.js';
import { minify } from 'html-minifier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildDir = path.join(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

fs.readdirSync(buildDir).forEach((file) => {
  fs.unlinkSync(path.join(buildDir, file));
});

const [indexLayout, articles] = await Promise.all([getIndexLayout(), getListOfArticleMetadata()]);
const indexHtml = _.template(indexLayout)({ listOfArticleMetadata: articles });
const minifiedIndexHtml = minify(indexHtml, {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true,
});

fs.writeFileSync(path.join(buildDir, 'index.html'), minifiedIndexHtml);

articles.forEach(async ({ slug }) => {
  const article = await getArticleDetail(slug);
  const postLayout = await getPostLayout();
  const postHtml = _.template(postLayout)({ article });
  const minifiedPostHtml = minify(postHtml, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });
  fs.writeFileSync(path.join(buildDir, `${slug}.html`), minifiedPostHtml);
});
