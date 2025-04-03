export class Article {
  title: string
  date: Date
  updatedAt: Date
  excerpt: string
  seoDescription: string
  github: string
  tags: string[]
  content: string

  constructor(title: string, date: Date, updatedAt: Date, excerpt: string, github: string, tags: string[], content: string) {
    this.title = title
    this.date = date
    this.updatedAt = updatedAt
    this.excerpt = content.split('\n').filter(Boolean)[0]
    this.seoDescription = excerpt
    this.github = github
    this.tags = tags
    this.content = content
  }

  get slug() {
    return this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
  }
}
