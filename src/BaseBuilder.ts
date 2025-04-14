import * as path from 'node:path'

export class BaseBuilder {
  outputFolderPath: string

  constructor() {
    this.outputFolderPath = path.resolve('./dist')
  }

  async build(_: string) {
    throw new Error('Subclass must implement build method')
  }
}
