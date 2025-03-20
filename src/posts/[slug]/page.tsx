import { getPostBySlug } from 'shared/db'
import { notFound } from 'next/navigation'
import Article from 'src/ui/Article'

type Params = Promise<{ slug: string }>

export default async function PostPage({ params }: { params: Params }) {
  const post = await getPostBySlug((await params).slug)

  if (!post) {
    notFound()
  }

  return <Article post={post} />
}

export async function generateStaticParams() {
  const postsResponse = await fetch('https://github.com/vespaiach/personal_website/blob/main/docs/posts.txt')
  const posts = await postsResponse.text()
  return posts.split('\n').map((post) => ({ slug: post }))
}