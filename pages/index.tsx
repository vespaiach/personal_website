import Head from 'next/head';
import { GetStaticProps } from 'next';

import Layout from '@components/Layout';
import { getSortedPostsData } from '@lib/posts';
import { Excerpt } from '@components/Excerpt';

export default function Home({ posts }: { posts: PostData[] }) {
  return (
    <Layout>
      <Head>
        <title>Learn to share</title>
      </Head>
      <header className="mb-11 pb-8 pt-10">
        <div className="max-w-3xl mx-5 md:ml-20">
          <h1 className="text-red-900 text-3xl font-bold">LEARN TO SHARE</h1>
          <h2 className="text-slate-900 font-bold">
            by{' '}
            <a className="underline decoration-red-900" href="https://github.com/vespaiach">
              Vespaiach
            </a>
          </h2>
        </div>
      </header>
      <main className="max-w-3xl mx-5 md:ml-20">
        {posts.map((post) => (
          <Excerpt post={post} key={post.id} />
        ))}
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
