import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { BaseBuilder } from './BaseBuilder.js'
import { nunjucks } from './utils.js'

export class AboutBuilder extends BaseBuilder {

  async generateHtml(): Promise<string> {
    return nunjucks.render('about.html')
  }

  async build() {
    const html = await this.generateHtml()
    const outputFilePath = path.join(`${this.outputFolderPath}/about.html`)
    await fs.writeFile(outputFilePath, html)
  }
}
