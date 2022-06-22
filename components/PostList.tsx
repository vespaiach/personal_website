import { format } from '@lib/utils';
import Link from 'next/link';

export default function PostList({ posts }: { posts: PostData[] }) {
    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <ul>
                {posts.map((post) => (
                    <li key={post.id} className="py-5">
                        <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                            <dl>
                                <dt className="sr-only">Published on</dt>
                                <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                                    <time dateTime={post.date.toISOString()}>{format(post.date)}</time>
                                </dd>
                            </dl>
                            <div className="space-y-3 xl:col-span-3">
                                <div>
                                    <h3 className="text-2xl font-bold leading-8 tracking-tight">
                                        <Link href={`/posts/${post.id}`}>
                                            <a
                                                className="text-gray-800 dark:text-gray-100 hover:text-cyan-600"
                                                title={post.title}>
                                                {post.title}
                                            </a>
                                        </Link>
                                    </h3>
                                    <div className="flex flex-wrap">
                                        {post.tags.map((tag, i) => (
                                            <Link key={i} href={`/tags/${tag}`}>
                                                <a className="mr-3 text-sm font-medium uppercase text-gray-200 hover:text-cyan-600">
                                                    {tag}
                                                </a>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                                    {post.excerpt}
                                </div>
                            </div>
                        </article>
                    </li>
                ))}
            </ul>
        </div>
    );
}
