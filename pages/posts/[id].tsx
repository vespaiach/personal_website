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
        <title>{post.title}</title>
      </Head>
      <header className="max-w-3xl mx-5 md:ml-20">
        <h1 className="font-heading text-3xl mt-10 text-red-900 font-bold mb-2">{post.title}</h1>
        <p className="mb-6 font-heading">{format(new Date(post.date), 'MMMM qq, yyyy')}</p>
      </header>
      <main className="max-w-3xl mx-5 md:ml-20">
        <article className="mb-16">
          <p className="mb-2 font-semibold">{post.excerpt}</p>
          <div className="article" dangerouslySetInnerHTML={{ __html: post.content }} />
          <p className="flex flex-row items-center mt-8">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0 });
              }}
              className="underline">
              top
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
