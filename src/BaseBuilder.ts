import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import _ from 'lodash'

export class BaseBuilder {
  templateFilePath: string
  outputFolderPath: string

  constructor() {
    this.templateFilePath = path.resolve('./templates/post.html')
    this.outputFolderPath = path.resolve('./dist')
  }

  async getCompiledTemplate() {
    const rawTemplate = await fs.readFile(this.templateFilePath, 'utf-8')
    return _.template(rawTemplate)
  }

  async ensureOutputFolderExists() {
    try {
      await fs.access(this.outputFolderPath)
    } catch {
      fs.mkdir(this.outputFolderPath)
    }
  }

  async build(_: string) {
    throw new Error('Subclass must implement build method')
  }
}
