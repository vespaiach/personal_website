import { Article } from './Article.js'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import * as _ from 'lodash'
import { BaseBuilder } from './BaseBuilder.js'
import { marked } from 'marked'

export class ArticleBuilder extends BaseBuilder {
  #reader: { read(name: string): Promise<Article> }

  constructor(reader: { read(name: string): Promise<Article> }) {
    super()
    this.#reader = reader
  }

  async generateHtml(article: Article): Promise<string> {
    const compiler = await this.getCompiledTemplate()
    return compiler({ article: { ...article, content: marked(article.content) } })
  }

  async build(name: string) {
    const article = await this.#reader.read(name)
    const [html] = await Promise.all([this.generateHtml(article), this.ensureOutputFolderExists()])
    const outputFilePath = path.join(`${this.outputFolderPath}/${article.slug}.html`)
    await fs.writeFile(outputFilePath, html)
  }
}
