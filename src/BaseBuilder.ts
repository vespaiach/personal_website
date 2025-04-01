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
    } catch (error) {
      console.error(error)
      console.error('Output folder does not exist, creating it...') 
      fs.mkdir(this.outputFolderPath)
    }
  }

  async build(_: string) {
    throw new Error('Subclass must implement build method')
  }
}
