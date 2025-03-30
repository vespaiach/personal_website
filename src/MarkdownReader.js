import fs from 'node:fs/promises'

export class MarkdownReader {
  async read(filePath) {
    return await fs.readFile(filePath, 'utf-8')
  }
}
