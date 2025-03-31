import * as path from 'node:path'
import * as fs from 'node:fs/promises'

export class BaseBuilder {
  outputFolderPath: string

  constructor() {
    this.outputFolderPath = path.resolve('./dist')
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
