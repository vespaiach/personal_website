import { ArticleBuilder } from './ArticleBuilder.js'
import * as fsSync from 'node:fs'
import * as path from 'node:path'
import { ArticleReader } from './ArticleReader.js'
import { getDocsFilePaths } from './utils.js'
import { ArticleIndexBuilder } from './ArticleIndexBuilder.js'
import { AboutBuilder } from './AboutBuilder.js'

async function buildArticles() {
  const articleBuilder = new ArticleBuilder(new ArticleReader())
  const indexBuilder = new ArticleIndexBuilder(new ArticleReader())
  const aboutBuilder = new AboutBuilder()

  const buildAllFiles = () => {
    getDocsFilePaths().then((articles) =>
      articles.forEach((fp) => {
        articleBuilder.build(fp)
      })
    )
    indexBuilder.build()
    aboutBuilder.build()
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
