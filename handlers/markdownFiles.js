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

export const getArticleDetail = async (slug) => {
  const filePath = path.join(docsDirectoryPath, `${slug}.md`);
  const { rawBody, ...rest } = await getFrontMatter(filePath);
  const renderer = new marked.Renderer();
  return { ...rest, content: marked.parse(rawBody, { renderer }) };
}
