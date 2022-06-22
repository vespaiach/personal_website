import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';

import { getAllTagsData, getPostsByTag } from '@lib/posts';
import Layout from '@components/Layout';
import PostList from '@components/PostList';
import Link from 'next/link';
import { cx } from '@lib/utils';

export default function Tag({ posts, tag, tags }: { tag: string; posts: PostData[]; tags: TagData[] }) {
    return (
        <Layout>
            <Head>
                <title>Tags: {tag} - Vespaiach</title>
            </Head>
            <main className="flex-1">
                <div className="border-b-1 flex flex-col items-start divide-y divide-gray-200 dark:divide-gray-700 md:mt-8 md:mb-10 sm:mb-6 md:flex-row md:items-center md:space-x-6 md:divide-y-0">
                    <div className="space-x-2 pt-6 pb-8 md:space-y-5">
                        <h1 className="pl-0 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:border-r-2 md:pr-6 md:text-6xl md:leading-14">
                            Tags
                        </h1>
                    </div>
                    <div className="flex max-w-lg flex-wrap">
                        {tags.map((t, i) => (
                            <div key={i} className={cx('mt-2 mb-2 mr-5', t.name === tag && 'border-b-2')}>
                                <Link href={`/tags/${t.name}`}>
                                    <a className="mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                                        {t.name}
                                    </a>
                                </Link>
                                <Link href={`/tags/${t.name}`}>
                                    <a className="-ml-2 text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">
                                        ({t.count})
                                    </a>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
                <PostList posts={posts} />
            </main>
        </Layout>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const tags = await getAllTagsData();
    return {
        paths: tags.map((t) => ({
            params: {
                name: t.name,
            },
        })),
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const posts = await getPostsByTag(params.name as string);
    const tags = await getAllTagsData();
    return {
        props: {
            posts,
            tags,
            tag: params.name,
        },
    };
};
