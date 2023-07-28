import gulp from 'gulp';
import transform from '../plugins/transform.mjs';
import pug from 'pug';
import through2 from 'through2';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';

const { src } = gulp;

const order = [
  'working-with-date-in-javascript',
  'wheel-event-fired-twice-in-react-gesture-library',
  'use-prismjs-in-nextjs-with-remark-to-hightlight-code',
  'use-flake8-and-black',
  'typescript-null-check',
  'typescript-is-fantastic-or-annoying',
  'turn-off-browser-auto-scrolling-behaviour',
  'some-notes-in-javascript',
  'python-dictionary-notes',
  'invalid-hook-call-error',
  'install-jetbrains-mono-fonts-on-ubuntu',
  'hydration-failed-react-encoder-error',
  'avoid-screen-flicker-when-dark-mode-is-on',
  'auto-reset-variables',
];

export default function buildIndex(callback) {
  const frontmatters = [];
  const tagsMap = {};
  let total = 0;
  const add = (tag) => {
    if (tagsMap[tag]) {
      tagsMap[tag].count += 1;
      tagsMap[tag].slug = tag;
    } else {
      tagsMap[tag] = { count: 1, slug: tag };
    }
    total += 1;
  };

  src(order.map((slug) => `docs/${slug}.md`))
    .pipe(transform())
    .pipe(
      through2.obj(function (file, encoding, callback) {
        if (file.isBuffer()) {
          const { frontmatter } = file;
          const tagsList = frontmatter.tags.split(',').map((t) => t.trim().toLowerCase());
          tagsList.forEach(add);

          frontmatters.push({
            ...frontmatter,
            tags: tagsList,
            link: `${file.basename.replace(/\.[^/.]+$/, '')}.html`,
          });
        }

        callback(null, file);
      }),
    )
    .on('finish', () => {
      const compiler = pug.compileFile('layouts/index.pug');

      Readable.from(
        compiler({ frontmatters, tags: Object.values(tagsMap).sort((a, b) => a.slug.localeCompare(b.slug)), total }),
      ).pipe(createWriteStream('build/index.html'));

      callback();
    });
}
