import { MarkdownReader } from './MarkdownReader.js'
import { MarkdownParser } from './MarkdownParser.js'
import { HtmlTransformer } from './HtmlTransformer.js'
import { HtmlRenderer } from './HtmlRenderer.js'

export class ArticleBuilder {
  #_templateFilePath
  #_outputFolderPath
  #_reader
  #_parser
  #_transformer
  #_renderer

  constructor(templateFilePath, outputFolderPath) {
    this.#_templateFilePath = templateFilePath
    this.#_outputFolderPath = outputFolderPath
    this.#_reader = new MarkdownReader()
    this.#_parser = new MarkdownParser()
    this.#_transformer = new HtmlTransformer()
    this.#_renderer = new HtmlRenderer(this.#_templateFilePath, this.#_outputFolderPath)
  }

  async build(filePath) {
    try {
      const rawContent = await this.#_reader.read(filePath)
      let article = this.#_parser.parse(rawContent)
      article = this.#_transformer.transform(article)

      // Render the final HTML using the template
      await this.#_renderer.render(article)
    } catch (error) {
      console.error(`Error building article from file ${filePath}: ${error.message}`)
    }
  }
}
