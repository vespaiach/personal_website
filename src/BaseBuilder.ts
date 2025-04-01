import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { Mutex } from 'async-mutex'

const mutex = new Mutex()

export class BaseBuilder {
  outputFolderPath: string

  constructor() {
    this.outputFolderPath = path.resolve('./dist')
  }

  static async ensureOutputFolderExists(folderPath: string) {
    const release = await mutex.acquire() // Lock
    try {
      await fs.access(folderPath)
    } catch (error) {
      console.error(error)
      console.error('Output folder does not exist, creating it...')
      fs.mkdir(folderPath)
    } finally {
      release() // Release the lock
    }
  }

  async build(_: string) {
    throw new Error('Subclass must implement build method')
  }
}
