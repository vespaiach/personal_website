import fs from 'fs'
import matter from 'gray-matter'
import { marked } from 'marked'
import path from 'path'

type Metadata = Omit<ShortPost, 'slug'> & { rawContent: string }

export async function getPostsMetadata(): Promise<ShortPost[]> {
  const files = fs.readdirSync(path.join('docs'))

  return files.map((filename) => {
    const slug = filename.replace('.md', '')
    const rawData = readFile(slug)
    return { ...getMetadata(rawData), slug }
  })
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const rawData = readFile(slug)
  const { rawContent, ...rest } = getMetadata(rawData)
  return { ...rest, slug, content: await marked.parse(rawContent) }
}

function readFile(slug: string) {
  return fs.readFileSync(path.join('docs', slug + '.md'), 'utf-8')
}

function getMetadata(rawData: string): Metadata {
  const { data: frontmatter, content } = matter(rawData)

  return {
    title: frontmatter.title,
    date: frontmatter.date,
    excerpt: frontmatter.excerpt,
    tags: frontmatter.tags,
    github: frontmatter.github,
    rawContent: content
  }
}
