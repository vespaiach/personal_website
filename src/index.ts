import { ArticleBuilder } from './ArticleBuilder.js'
import * as fsSync from 'node:fs'
import * as path from 'node:path'
import { ArticleReader } from './ArticleReader.js'
import { getDocsFilePaths } from './utils.js'
import { ArticleIndexBuilder } from './ArticleIndexBuilder.js'

async function buildArticles() {
  const articleBuilder = new ArticleBuilder(new ArticleReader())
  const indexBuilder = new ArticleIndexBuilder(new ArticleReader())

  const buildAllFiles = async () => {
    ;(await getDocsFilePaths()).forEach((fp) => {
      articleBuilder.build(fp)
    })
  }

  indexBuilder.build()
  buildAllFiles()

  if (process.argv && process.argv.includes('--watch')) {
    fsSync.watch(path.resolve('./docs'), { persistent: true }, async () => {
      buildAllFiles()
      indexBuilder.build()
    })

    fsSync.watch(path.resolve('./templates'), { persistent: true }, async () => {
      buildAllFiles()
      indexBuilder.build()
    })

    fsSync.watch(path.resolve('./assets'), { persistent: true }, async () => {
      buildAllFiles()
      indexBuilder.build()
    })

    console.log('Built! Watching for changes in the docs and templates directories...')
  }
}
buildArticles()
