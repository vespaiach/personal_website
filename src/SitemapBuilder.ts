import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { BaseBuilder } from './BaseBuilder.js'
import { getDocsFilePaths, minify, nunjucks } from './utils.js'
import { Article } from './Article.js'

export class SitemapBuilder extends BaseBuilder {
  #reader: { read(name: string): Promise<Article> }

  constructor(reader: { read(name: string): Promise<Article> }) {
    super()
    this.#reader = reader
  }

  async generateHtml(articles: Article[]): Promise<string> {
    return nunjucks.render('sitemap.xml', { articles })
  }

  async getArticles(): Promise<Article[]> {
    const fileNames = await getDocsFilePaths()
    const articles: Article[] = []

    for (const name of fileNames) {
      const article = await this.#reader.read(name)
      articles.push(article)
    }

    return articles
  }

  // TODO; extract this to a base class, the only difference is here is generateHtml method
  async build() {
    const [html] = await Promise.all([this.generateHtml(await this.getArticles()), BaseBuilder.ensureOutputFolderExists(this.outputFolderPath)])
    const outputFilePath = path.join(`${this.outputFolderPath}/sitemap.xml`)
    await fs.writeFile(outputFilePath, await minify(html))
  }
}
