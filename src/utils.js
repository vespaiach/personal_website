import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'
import { format } from 'date-fns'
import { marked } from 'marked'

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function getPosts() {
  const slugs = await getSlugs()
  return sortAndFormatByDate(
    await Promise.all(
      slugs.map(async (slug) => {
        const content = await readFileContent(slugToPath(slug))
        const matterData = matter(content)
        return { ...matterData.data, slug, content: marked.parse(matterData.content) }
      })
    )
  )
}

export async function readFileContent(filePath) {
  return await fs.readFile(filePath, 'utf-8')
}

function sortAndFormatByDate(matters) {
  return matters
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((matter) => ({ ...matter, date: format(new Date(matter.date), 'MMMM d, yyyy') }))
}

function slugToPath(slug) {
  return path.resolve(__dirname, '../docs', `${slug}.md`)
}

async function getSlugs() {
  const dir = path.resolve(__dirname, '../docs')
  const dirents = await fs.readdir(dir, { withFileTypes: true })
  return await Promise.all(dirents.map((dirent) => (dirent.isFile() ? path.parse(dirent.name).name : null)).filter((f) => f !== null))
}
