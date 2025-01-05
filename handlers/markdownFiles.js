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
  return { ...rest, content: marked.parse(rawBody) };
}

// function getHTMLContent(filePath) {
//   const markdown = fs.readFileSync(filePath, 'utf-8');
//   const { body } = fm(markdown);
//   return marked.parse(body);
// }

// function getIndexPageLayout() {
//   const indexPage = path.resolve(import.meta.dirname, '..', 'layouts', 'index.html');
//   return fs.readFileSync(indexPage, 'utf-8');
// }

// export function buildIndexPage() {
//   const frontMatters = getFrontMatter(getListOfDocsFilePaths());
//   const indexPageContent = getIndexPageLayout();
//   const html = _.template(indexPageContent)({ frontMatters });

//   const distDirectoryPath = path.resolve(import.meta.dirname, '..', 'dist');
//   if (!fs.existsSync(distDirectoryPath)) {
//     fs.mkdirSync(distDirectoryPath, { recursive: true });
//   }
//   const indexFilePath = path.join(distDirectoryPath, 'index.html');
//   fs.writeFileSync(indexFilePath, html, { flag: 'w' });
// }

// export function buildDocPage(filePath) {
//   const content = getHTMLContent(filePath);
//   const docPageLayout = path.resolve(import.meta.dirname, '..', 'layouts', 'post.html');
//   const docPageContent = fs.readFileSync(docPageLayout, 'utf-8');
//   const html = _.template(docPageContent)({ frontMatters, content: getHTMLContent(filePath) });

//   const distDirectoryPath = path.resolve(import.meta.dirname, '..', 'dist');
//   if (!fs.existsSync(distDirectoryPath)) {
//     fs.mkdirSync(distDirectoryPath, { recursive: true });
//   }
//   const docFilePath = path.join(distDirectoryPath, `${path.basename(filePath, '.md')}.html`);
//   fs.writeFileSync(docFilePath, html, { flag: 'w' });
// }
