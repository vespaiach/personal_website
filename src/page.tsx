import Link from 'next/link'
import { getPostsMetadata } from 'shared/db'
import { formatDate, sortDateDesc } from './lib/date'

export default async function Home() {
  const posts = sortDateDesc(await getPostsMetadata())
  return (
    <main>
      <h1>null</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug} className="flex flex-col py-1">
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            <small className="text-gray-600 dark:text-gray-400">{formatDate(post.date)}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}
