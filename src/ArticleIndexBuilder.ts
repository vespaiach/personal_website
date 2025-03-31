import { Article } from './Article.js'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import * as _ from 'lodash'
import { BaseBuilder } from './BaseBuilder.js'
import { getDocsFilePaths, sortByDate } from './utils.js'

export class ArticleIndexBuilder extends BaseBuilder {
  #reader: { read(name: string): Promise<Article> }

  constructor(reader: { read(name: string): Promise<Article> }) {
    super()
    this.#reader = reader
    this.templateFilePath = path.resolve('./templates/index.html')
  }

  async generateHtml(articles: Article[]): Promise<string> {
    const compiler = await this.getCompiledTemplate()
    return compiler({ articles })
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

  async build() {
    const [articles] = await Promise.all([this.getArticles(), this.ensureOutputFolderExists()])
    const html = await this.generateHtml(sortByDate(articles))
    const outputFilePath = path.join(`${this.outputFolderPath}/index.html`)
    await fs.writeFile(outputFilePath, html)
  }
}
