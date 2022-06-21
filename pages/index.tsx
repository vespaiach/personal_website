import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '@components/Layout';
import { getSortedPostsData } from '@lib/posts';
import { format } from '@lib/utils';

export default function Home({ posts }: { posts: PostData[] }) {
    return (
        <Layout>
            <Head>
                <title>Posts - Vespaiach</title>

                {process.env.NEXT_PUBLIC_GTAG_ID && (
                    <>
                        <script
                            async
                            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_ID}`}></script>
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GTAG_ID}');
            `,
                            }}
                        />
                    </>
                )}

                <meta
                    name="description"
                    content="Knowledge sharing is the way to make our life better, and that is all this website about."
                />
            </Head>
            <main className="mb-auto">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <ul>
                        {posts.map((post) => (
                            <li key={post.id} className="py-5">
                                <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                                    <dl>
                                        <dt className="sr-only">Published on</dt>
                                        <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                                            <time dateTime={post.date.toISOString()}>
                                                {format(post.date)}
                                            </time>
                                        </dd>
                                    </dl>
                                    <div className="space-y-3 xl:col-span-3">
                                        <div>
                                            <h3 className="text-2xl font-bold leading-8 tracking-tight">
                                                <Link href={`/posts/${post.id}`}>
                                                    <a
                                                        className="text-gray-900 dark:text-gray-100"
                                                        title={post.title}>
                                                        {post.title}
                                                    </a>
                                                </Link>
                                            </h3>
                                            <div className="flex flex-wrap">
                                                {post.tags.map((tag, i) => (
                                                    <Link key={i} href={`/tags/${tag}`}>
                                                        <a className="mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
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
            </main>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const posts = getSortedPostsData();
    return {
        props: {
            posts,
        },
    };
};
