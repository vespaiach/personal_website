import { GetStaticProps } from 'next';
import Head from 'next/head';

import Layout from '@components/Layout';
import { getSortedPostsData, serialize } from '@lib/posts';
import PostList from '@components/PostList';

export default function Home({ posts }: { posts: SerializedPostData[] }) {
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
