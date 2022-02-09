import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '@components/Layout';
import { getSortedPostsData } from '@lib/posts';
import { Share } from '@components/Share';

export default function Home({ posts }: { posts: PostData[] }) {
  return (
    <Layout>
      <Head>
        <title>Learn to share - by Vespaiach</title>
        <meta
          name="description"
          content="Knowledge sharing is the way to make our life better, and that is all this website about."
        />
      </Head>
      <header className="mb-11 pb-10 pt-16 bg-red-900">
        <div className="max-w-3xl mx-5 md:ml-20">
          <h1 className="text-white text-5xl font-bold">LEARN TO SHARE</h1>
          <h2 className="text-white font-bold">
            by{' '}
            <a className="underline decoration-white" href="https://github.com/vespaiach">
              Vespaiach
            </a>
          </h2>
        </div>
      </header>
      <main className="max-w-3xl mx-5 md:ml-20">
        {posts.map((post) => (
          <article key={post.id} className="mb-20">
            <h3 className="font-heading text-3xl text-red-900 font-bold mb-2">{post.title}</h3>
            <p className="mb-7 uppercase text-sm">{format(new Date(post.date), 'MMMM dd, yyyy')}</p>
            <p className="mb-5 font-semibold">{post.excerpt}</p>
            <p className="flex flex-row items-center">
              <Link href={`/posts/${post.id}`}>
                <span className="underline cursor-pointer">read more</span>
              </Link>
              <Share link={`https://vespaiach.com/posts/${post.id}`} title={post.title} />
            </p>
          </article>
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
