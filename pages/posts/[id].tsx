import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';

import Layout from '../../components/layout';
import { getAllPostIds, getPost } from '../../lib/posts';
import { Post } from '../../components/Post';

export default function PostI({ post }: { post: PostData }) {
  return (
    <Layout github={post.github} showSearch={false}>
      <Head>
        <title>{post.title}</title>
      </Head>
      <Post excerpt={false} post={post} />
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
