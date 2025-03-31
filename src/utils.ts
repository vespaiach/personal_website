import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Article } from './Article.js'
import templateEngine from 'nunjucks'

const monthds = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const nunjucks = templateEngine.configure('templates', {
  autoescape: true,
  noCache: true
})

nunjucks.addFilter('date', function (dateStr: string) {
  const date = new Date(dateStr)
  return `${monthds[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
})

export async function getDocsFilePaths() {
  const docsFolderPath = path.resolve('./docs')
  const files = await fs.readdir(docsFolderPath)
  return files.map((fp) => `${docsFolderPath}/${fp}`)
}

export function sortByDate(articles: Article[]): Article[] {
  return articles.sort((a, b) => b.date.getTime() - a.date.getTime())
}
