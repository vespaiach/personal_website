import { marked } from 'marked'
import { Article } from '../Article.js'
import { BaseBuilder } from './BaseBuilder.js'
import { nunjucks } from '../utils.js'

export class ArticleBuilder extends BaseBuilder {
  #article: Article

  constructor(article: Article) {
    super(article.slug)
    this.#article = article
  }

  generateHtml(): string {
    return nunjucks.render('post.html', { article: { ...this.#article, content: marked.parse(this.#article.content) } })
  }
}
