import { getPostBySlug } from 'shared/db'
import { notFound } from 'next/navigation'
import Article from '@/app/ui/Article'

type Params = Promise<{ slug: string }>

export default async function PostPage({ params }: { params: Params }) {
  const post = await getPostBySlug((await params).slug)

  if (!post) {
    notFound()
  }

  return <Article post={post} />
}
