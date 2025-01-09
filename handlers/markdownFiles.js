import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import fm from 'front-matter';

const docsDirectoryPath = path.resolve(import.meta.dirname, '..', 'docs');

const isMDFile = (fileName) => fs.lstatSync(fileName).isFile() && fileName.endsWith('.md');

const getListOfDocsFilePaths = () =>
  fs
    .readdirSync(docsDirectoryPath)
    .map((fileName) => path.join(docsDirectoryPath, fileName))
    .filter(isMDFile);

const getFrontMatter = async (filePath) => {
  const markdown = await fs.promises.readFile(filePath, 'utf-8');
  const { attributes, body } = fm(markdown);
  const date = new Date(attributes.date);
  const tags = attributes.tags.split(',').map((tag) => tag.trim().toLowerCase());
  const slug = path.basename(filePath).replace('.md', '');
  return { ...attributes, date, tags, slug, rawBody: body };
}

export const getListOfArticleMetadata = async () => {
  const filePaths = getListOfDocsFilePaths();
  return (await Promise.all(filePaths.map(getFrontMatter))).map(({ rawBody, ...rest}) => rest);
}

const langMap = {
  asm: 'shj-lang-asm',
  bash: 'shj-lang-bash',
  brainfuck: 'shj-lang-bf',
  c: 'shj-lang-c',
  css: 'shj-lang-css',
  csv: 'shj-lang-csv',
  diff: 'shj-lang-diff',
  docker: 'shj-lang-docker',
  git: 'shj-lang-git',
  go: 'shj-lang-go',
  html: 'shj-lang-html',
  http: 'shj-lang-http',
  ini: 'shj-lang-ini',
  java: 'shj-lang-java',
  javascript: 'shj-lang-js',
  js: 'shj-lang-js',
  jsdoc: 'shj-lang-jsdoc',
  json: 'shj-lang-json',
  log: 'shj-lang-log',
  lua: 'shj-lang-lua',
  makefile: 'shj-lang-make',
  markdown: 'shj-lang-md',
  md: 'shj-lang-md',
  perl: 'shj-lang-pl',
  plain: 'shj-lang-plain',
  python: 'shj-lang-py',
  py: 'shj-lang-py',
  regex: 'shj-lang-regex',
  rust: 'shj-lang-rs',
  sql: 'shj-lang-sql',
  todo: 'shj-lang-todo',
  toml: 'shj-lang-toml',
  typescript: 'shj-lang-ts',
  ts: 'shj-lang-ts',
  uri: 'shj-lang-uri',
  xml: 'shj-lang-xml',
  yaml: 'shj-lang-yaml'
};

export const getArticleDetail = async (slug) => {
  const filePath = path.join(docsDirectoryPath, `${slug}.md`);
  const { rawBody, ...rest } = await getFrontMatter(filePath);
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => {
    return `<div class="${langMap[lang] ?? 'shj-lang-bash'}">${text}</div>`;
  };
  return { ...rest, content: marked.parse(rawBody, { renderer }) };
}
