import { ArticleBuilder } from './ArticleBuilder.js'
import * as fsSync from 'node:fs'
import * as path from 'node:path'
import { ArticleReader } from './ArticleReader.js'
import { getDocsFilePaths } from './utils.js'
import { ArticleIndexBuilder } from './ArticleIndexBuilder.js'
import { AboutBuilder } from './AboutBuilder.js'
import { SitemapBuilder } from './SitemapBuilder.js'
import * as fs from 'node:fs/promises'
import { Mutex } from 'async-mutex'

const mutex = new Mutex()

async function ensureOutputFolderExists(folderPath: string) {
  const release = await mutex.acquire() // Lock
  try {
    await fs.access(folderPath)
  } catch (error) {
    console.error(error)
    console.error('Output folder does not exist, creating it...')
    fs.mkdir(folderPath)
  } finally {
    release() // Release the lock
  }
}

async function buildArticles() {
  await ensureOutputFolderExists(path.resolve('./dist'))

  const articleReader = new ArticleReader()
  const articleBuilder = new ArticleBuilder(new ArticleReader())
  const indexBuilder = new ArticleIndexBuilder(articleReader)
  const aboutBuilder = new AboutBuilder()

  const buildAllFiles = () => {
    getDocsFilePaths().then((articles) =>
      articles.forEach((fp) => {
        articleBuilder.build(fp)
      })
    )
    indexBuilder.build()
    aboutBuilder.build()
    new SitemapBuilder(articleReader).build()
  }

  buildAllFiles()

  if (process.argv && process.argv.includes('--watch')) {
    fsSync.watch(path.resolve('./docs'), { persistent: true },  buildAllFiles)
    fsSync.watch(path.resolve('./templates'), { persistent: true }, buildAllFiles)
    fsSync.watch(path.resolve('./assets'), { persistent: true }, buildAllFiles)
    console.log('Built! Watching for changes in the docs and templates directories...')
  }
}
buildArticles()
