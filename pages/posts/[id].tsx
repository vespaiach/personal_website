import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';

import { Share } from '@components/Share';
import { getAllPostIds, getPost } from '@lib/posts';
import Layout from '@components/Layout';

export default function PostI({ post }: { post: PostData }) {
  return (
    <Layout>
      <Head>
        <title>{post.title} - by Vespaiach</title>
      </Head>
      <header className="max-w-3xl mx-5 md:ml-20">
        <h1 id={post.id} className="font-heading text-4xl mt-16 text-red-900 font-bold mb-6">
          {post.title}
        </h1>
        <p className="mb-12 uppercase text-sm ml-1">{format(new Date(post.date), 'MMMM qq, yyyy')}</p>
      </header>
      <main className="max-w-3xl mx-5 md:ml-20">
        <article className="mb-16">
          <p className="mb-7 font-semibold">{post.excerpt}</p>
          <div className="article" dangerouslySetInnerHTML={{ __html: post.content }} />
          <p className="flex flex-row items-center mt-8">
            <a href={`#${post.id}`} className="underline">
              top
            </a>
            <span className="px-4"> | </span>
            <a href="/" className="underline">
              home
            </a>
            <Share link={`https://vespaiach.com/posts/${post.id}`} title={post.title} />
          </p>
        </article>
      </main>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getPost(params.id as string);
  return {
    props: {
      post,
    },
  };
};
