import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Article } from './Article.js'

export async function getDocsFilePaths() {
  const docsFolderPath = path.resolve('./docs')
  const files = await fs.readdir(docsFolderPath)
  return files.map((fp) => `${docsFolderPath}/${fp}`)
}

export function sortByDate(articles: Article[]): Article[] {
  return articles.sort((a, b) => b.date.getTime() - a.date.getTime())
}
