import { GetStaticProps } from 'next';
import Head from 'next/head';

import Layout from '@components/Layout';
import { getSortedPostsData, serialize } from '@lib/posts';
import PostList from '@components/PostList';

export default function Home({ posts }: { posts: SerializedPostData[] }) {
    return (
        <Layout>
            <Head>
                <title>Posts - Nguyen's Blog</title>
                <meta
                    name="description"
                    content="Knowledge sharing is the way to make our life better, and that is all this website about."
                />
            </Head>
            <main className="mb-auto">
                <PostList posts={posts} />
            </main>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const posts = (await getSortedPostsData()).map(serialize);
    return {
        props: {
            posts,
        },
    };
};
