import { ArticleBuilder } from './ArticleBuilder.js'
import fs from 'node:fs/promises'
import path from 'node:path'

async function ensureDistFolderExists() {
  const distFolderPath = path.resolve('./dist')
  try {
    await fs.access(distFolderPath, fs.constants.R_OK | fs.constants.W_OK)
  } catch {
    await fs.mkdir(distFolderPath)
  }
}

async function buildArticles() {
  await ensureDistFolderExists()
  const articleTemplatePath = path.resolve('./templates/post.html')
  const outputFolderPath = path.resolve('./dist')

  const articleBuilder = new ArticleBuilder(articleTemplatePath, outputFolderPath)
  const filePaths = await fs.readdir(path.resolve('./docs'))
  filePaths.map(fp => path.resolve('./docs', fp)).forEach(fp => { articleBuilder.build(fp) })
}

buildArticles()
