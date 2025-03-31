const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export class Article {
  title: string
  date: Date
  excerpt: string
  github: string
  tags: string[]
  content: string

  constructor(title: string, date: Date, excerpt: string, github: string, tags: string[], content: string) {
    this.title = title
    this.date = date
    this.excerpt = excerpt
    this.github = github
    this.tags = tags
    this.content = content
  }

  get formattedDate(): string {
    return `${months[this.date.getMonth()]} ${this.date.getDate()}, ${this.date.getFullYear()}`
  }

  get slug() {
    return this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
  }
}
