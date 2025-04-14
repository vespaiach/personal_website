import { BaseBuilder } from './BaseBuilder.js'
import { nunjucks } from '../utils.js'
import { Article } from '../Article.js'

export class SitemapBuilder extends BaseBuilder {
  #articles: Article[]

  constructor(articles: Article[]) {
    super('sitemap', 'xml')
    this.#articles = articles
  }

  generateHtml(): string {
    return nunjucks.render('sitemap.xml', { articles: this.#articles })
  }
}
