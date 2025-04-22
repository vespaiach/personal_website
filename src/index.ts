import { ArticleBuilder } from './builders/ArticleBuilder.js'
import * as fsSync from 'node:fs'
import * as path from 'node:path'
import { ArticleReader } from './ArticleReader.js'
import { getDocsFilePaths } from './utils.js'
import { ArticleIndexBuilder } from './builders/ArticleIndexBuilder.js'
import { AboutBuilder } from './builders/AboutBuilder.js'
import { SitemapBuilder } from './builders/SitemapBuilder.js'
import * as fs from 'node:fs/promises'

async function ensureOutputFolderExists(folderPath: string) {
  try {
    await fs.access(folderPath)
  } catch (error) {
    console.log('Output folder does not exist, creating it...')
    await fs.mkdir(folderPath)
  }
}

async function buildArticles() {
  await ensureOutputFolderExists(path.resolve('./dist'))

  const articleReader = new ArticleReader()

  const buildAllFiles = async () => {
    const articlesPaths = await getDocsFilePaths()
    let articles = await Promise.all(articlesPaths.map(async (fp) => {
      const article = await articleReader.read(fp)
      new ArticleBuilder(article).build()
      return article
    }))
    articles = articles.sort((a, b) => b.date.getTime() - a.date.getTime())  

    new ArticleIndexBuilder(articles).build()
    new SitemapBuilder(articles).build()
    new AboutBuilder().build()
  }

  await buildAllFiles()

  if (process.argv && process.argv.includes('--watch')) {
    fsSync.watch(path.resolve('./docs'), { persistent: true }, buildAllFiles)
    fsSync.watch(path.resolve('./templates'), { persistent: true }, buildAllFiles)
    fsSync.watch(path.resolve('./assets'), { persistent: true }, buildAllFiles)
    console.log('Built! Watching for changes in the docs and templates directories...')
  }
}

buildArticles()
