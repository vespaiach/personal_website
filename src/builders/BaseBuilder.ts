import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { minify } from '../utils.js'

export class BaseBuilder {
  slug: string
  outputFolderPath: string

  constructor(slug: string) {
    this.slug = slug
    this.outputFolderPath = path.resolve('./dist')
  }

  generateHtml(): string {
    throw new Error('Subclass must implement generateHtml method')
  }

  async build(): Promise<void> {
    const html = this.generateHtml()
    const outputFilePath = path.join(`${this.outputFolderPath}/${this.slug}.html`)
    await fs.writeFile(outputFilePath, await minify(html))
  }
}
