import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { marked } from 'marked'
import { Article } from './Article.js'
import { BaseBuilder } from './BaseBuilder.js'
import { nunjucks } from './utils.js'

export class ArticleBuilder extends BaseBuilder {
  #reader: { read(name: string): Promise<Article> }

  constructor(reader: { read(name: string): Promise<Article> }) {
    super()
    this.#reader = reader
  }

  async generateHtml(article: Article): Promise<string> {
    return nunjucks.render('post.html', { article: { ...article, content: marked.parse(article.content) } })
  }

  // TODO; extract this to a base class, the only difference is here is generateHtml method 
  async build(name: string) {
    const article = await this.#reader.read(name)
    const [html] = await Promise.all([this.generateHtml(article), BaseBuilder.ensureOutputFolderExists(this.outputFolderPath)])
    const outputFilePath = path.join(`${this.outputFolderPath}/${article.slug}.html`)
    await fs.writeFile(outputFilePath, html)
  }
}
