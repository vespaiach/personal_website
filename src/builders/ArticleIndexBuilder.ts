import { Article } from '../Article.js'
import { BaseBuilder } from './BaseBuilder.js'
import { nunjucks } from '../utils.js'

export class ArticleIndexBuilder extends BaseBuilder {
  #articles: Article[]

  constructor(articles: Article[]) {
    super('index')
    this.#articles = articles
  }

  generateHtml(): string {
    return nunjucks.render('index.html', { articles: this.#articles, tags: this.#getTags() })
  }

  #getTags(): string[] {
    const tags = new Set<string>()
    this.#articles.forEach((article) => {
      article.tags.forEach((tag) => {
        tags.add(`"${tag}"`)
      })
    })
    return Array.from(tags)
  }
}
