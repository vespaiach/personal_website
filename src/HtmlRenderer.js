import fs from 'fs/promises'
import _ from 'lodash'

export class HtmlRenderer {
  #_compiledTemplate
  #_outputFolder

  constructor(templateFilePath, outputFolderPath) {
    this.#_readTemplate(templateFilePath)
    this.#_outputFolder = outputFolderPath
  }

  async #_readTemplate(filePath) {
    try {
      const rawTemplate = await fs.readFile(filePath, 'utf-8')
      this.#_compiledTemplate = _.template(rawTemplate)
    } catch (error) {
      console.error(`Error reading template file: ${error.message}`)
      throw error
    }
  }

  async render(article) {
    try {
      const html = this.#_compiledTemplate({ article })

      await fs.writeFile(`${this.#_outputFolder}/${article.slug}.html`, html)
    } catch (error) {
      console.error(`Error rendering markdown file: ${error.message}`)
    }
  }
}
