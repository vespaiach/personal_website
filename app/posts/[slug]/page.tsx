import { getPostBySlug } from 'shared/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <main>
      <Link href="/">
        <small>← back</small>
      </Link>
      <h1 className="mt-6">{post.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: post.content }} />
      <Link href="/">
        <small>← back</small>
      </Link>
    </main>
  )
}
