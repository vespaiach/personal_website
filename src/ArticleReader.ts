import * as fs from 'node:fs/promises'
import { Article } from './Article.js'
import matter from 'gray-matter'

export class ArticleReader {
  async #getRawContent(filePath: string) {
    return await fs.readFile(filePath, 'utf-8')
  }

  async read(name: string): Promise<Article> {
    const rawContent = await this.#getRawContent(name)
    const { data: frontMatter, content } = matter(rawContent)
    const tags = ((frontMatter.tags || '') as string)
      .split(',')
      .filter(Boolean)
      .map((t) => t.trim())
    return new Article(frontMatter.title, new Date(frontMatter.date), frontMatter.excerpt, frontMatter.github, tags, content)
  }
}
