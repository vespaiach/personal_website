import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { BaseBuilder } from './BaseBuilder.js'
import { minify, nunjucks } from './utils.js'

export class AboutBuilder extends BaseBuilder {
  async generateHtml(): Promise<string> {
    return nunjucks.render('about.html')
  }

  // TODO; extract this to a base class, the only difference is here is generateHtml method
  async build() {
    const [html] = await Promise.all([this.generateHtml(), BaseBuilder.ensureOutputFolderExists(this.outputFolderPath)])
    const outputFilePath = path.join(`${this.outputFolderPath}/about.html`)
    await fs.writeFile(outputFilePath, await minify(html))
  }
}
