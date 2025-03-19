import matter from 'gray-matter'
import { marked } from 'marked'

const basePath = 'https://github.com/vespaiach/personal_website/blob/main/docs'

type Metadata = Omit<ShortPost, 'slug'> & { rawContent: string }

export async function getPostsMetadata(): Promise<ShortPost[]> {
  const slugs = await getSlugs()
  return await Promise.all(
    slugs.map(async (slug) => {
      const rawData = await readFile(buildURL(slug))
      return { ...getMetadata(rawData), slug }
    })
  )
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const rawData = await readFile(buildURL(slug))
  const { rawContent, ...rest } = getMetadata(rawData)
  return { ...rest, slug, content: await marked.parse(rawContent) }
}

async function getSlugs() {
  const content = await readFile(`${basePath}/slugs.txt`)
  return content.split('\n').map((slug) => slug.trim())
}

async function getListOfURLs() {
  const slugs = await getSlugs()
  return slugs.map(buildURL)
}

function buildURL(slug: string) {
  return `${basePath}/posts/${slug}.md`
}

function readFile(file: string) {
  return fetch(file).then((res) => res.text())
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
