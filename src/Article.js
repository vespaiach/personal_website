const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export class Article {
  #_tags

  constructor({ title, date, excerpt, github, tags, rawContent, content = null }) {
    this.title = title
    this.date = date
    this.excerpt = excerpt
    this.github = github
    this.#_tags = tags
    this.rawContent = rawContent
    this.content = content
    this.formattedDate = `${months[this.date.getMonth()]} ${this.date.getDate()}, ${this.date.getFullYear()}`
  }

  get slug() {
    return this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
  }

  get tags() {
    return (this.#_tags || '')
      .split(',')
      .filter(Boolean)
      .map((tag) => tag.trim())
  }

  get;
}
