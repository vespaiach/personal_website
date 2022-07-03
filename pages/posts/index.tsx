import { GetStaticProps } from 'next';

import Layout from '@components/Layout';
import { getSortedPostsData, serialize } from '@lib/posts';
import PostList from '@components/PostList';

export default function Home({ posts }: { posts: SerializedPostData[] }) {
    return (
        <Layout title="Posts List - Nguyen's Blog">
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
