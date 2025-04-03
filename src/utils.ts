import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Article } from './Article.js'
import templateEngine from 'nunjucks'
import { minify as minifier } from 'html-minifier-terser'
import { format } from 'date-fns'

export const nunjucks = templateEngine.configure('templates', {
  autoescape: true,
  noCache: true
})

nunjucks.addFilter('date', function (dateStr: string, formatPattern = 'PPP') {
  const date = new Date(dateStr)
  return format(date, formatPattern);
})

nunjucks.addFilter('join', function (str: string[], by = ', ') {
  return str.join(by)
})

export async function getDocsFilePaths() {
  const docsFolderPath = path.resolve('./docs')
  const files = await fs.readdir(docsFolderPath)
  return files.map((fp) => `${docsFolderPath}/${fp}`)
}

export function sortByDate(articles: Article[]): Article[] {
  return articles.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export async function minify(src: string) {
  return await minifier(src, {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    minifyURLs: true,
    // processScripts: ['application/ld+json']
  })
}
