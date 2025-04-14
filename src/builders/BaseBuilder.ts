import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { minify } from '../utils.js'

export class BaseBuilder {
  slug: string
  outputFolderPath: string
  extension: string

  constructor(slug: string, extension: string = 'html') {
    this.slug = slug
    this.outputFolderPath = path.resolve('./dist')
    this.extension = extension
  }

  generateHtml(): string {
    throw new Error('Subclass must implement generateHtml method')
  }

  async build(): Promise<void> {
    const html = this.generateHtml()
    const outputFilePath = path.join(`${this.outputFolderPath}/${this.slug}.${this.extension}`)
    await fs.writeFile(outputFilePath, await minify(html))
  }
}
