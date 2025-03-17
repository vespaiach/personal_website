import { getPostBySlug } from 'shared/db'
import { notFound } from 'next/navigation'
import Article from '@/app/ui/Article'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(await params.slug)

  if (!post) {
    notFound()
  }

  return <Article post={post} /> 
}
