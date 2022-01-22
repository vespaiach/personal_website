import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';

import { Share } from '@components/Share';
import { getAllPostIds, getPost } from '@lib/posts';
import Layout from '@components/Layout';

export default function Post({ post }: { post: PostData }) {
  const date = format(new Date(post.date), 'MMMM qq, yyyy');

  return (
    <Layout>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt} />
      </Head>
      <header className="max-w-3xl mx-5 md:ml-20">
        <h1 id={post.id} className="font-heading text-5xl mt-16 text-red-900 font-bold mb-6">
          {post.title}
        </h1>
        <p className="mb-12 uppercase text-sm ml-1">{date}</p>
      </header>
      <main className="max-w-3xl mx-5 md:ml-20">
        <article className="mb-16">
          <p className="mb-7 font-semibold">{post.excerpt}</p>
          <div className="article" dangerouslySetInnerHTML={{ __html: post.content }} />
          <p className="flex flex-row items-center mt-8">
            <a href={`#${post.id}`} className="underline">
              top
            </a>
            <span className="px-3"> | </span>
            <a href="/" className="underline">
              home
            </a>
            <Share link={`https://vespaiach.com/posts/${post.id}`} title={post.title} />
          </p>
        </article>
      </main>
      <footer className="py-3 bg-red-900">
        <p className="mx-5 max-w-3xl md:ml-20 text-white flex items-center">
          <span className="mr-1">by</span>
          <a href="https://github.com/vespaiach" className="underline">
            Vespaiach
          </a>
          <a
            href={`https://github.com/vespaiach/personal_website/issues/new?title=${post.title}`}
            className="ml-auto underline">
            report
          </a>
        </p>
      </footer>
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
