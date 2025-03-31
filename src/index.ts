import { ArticleBuilder } from './ArticleBuilder.js'
import * as fs from 'node:fs/promises'
import * as fsSync from 'node:fs'
import * as path from 'node:path'
import { ArticleReader } from './ArticleReader.js'
import { getDocsFilePaths } from './utils.js'
import { ArticleIndexBuilder } from './ArticleIndexBuilder.js'

const docsFolderPath: string = path.resolve('./docs')

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

  if (process.env.NODE_ENV !== 'production') {
    fsSync.watch(docsFolderPath, { persistent: true }, async (_, fileName) => {
      if (!fileName) {
        console.error('Filename is undefined')
        return
      }

      try {
        const filePath = path.join(docsFolderPath, fileName)
        await fs.access(path.resolve('docs', filePath), fs.constants.F_OK)
        await Promise.all([articleBuilder.build(filePath), indexBuilder.build()])
        console.log(`File changed: ${fileName}`)
      } catch (err) {
        console.error(`File deleted: ${fileName}`)
      }
    })

    fsSync.watch(path.resolve('./templates'), { persistent: true }, async () => {
      buildAllFiles()
      indexBuilder.build()
    })

    console.log('Built! Watching for changes in the docs and templates directories...')
  }
}
buildArticles()
