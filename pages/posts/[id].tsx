import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';

import { serialize, getAllPostIds, getPostById } from '@lib/posts';
import Layout from '@components/Layout';
import UpIcon from '@components/UpIcon';
import { separator } from '@lib/utils';

export default function Post({ post }: { post: SerializedPostData }) {
    return (
        <Layout
            report={`https://github.com/vespaiach/personal_website/issues/new?title=[Report] ${post.title}&body=[${post.title}](${post.github})`}>
            <Head>
                <title>{post.title}</title>
                <meta name="description" content={post.excerpt} />
            </Head>
            <main className="mb-auto mt-2">
                <div className="fixed right-8 bottom-8 hidden flex-col gap-3 md:hidden">
                    <button
                        aria-label="Scroll To Top"
                        type="button"
                        className="rounded-full bg-gray-200 p-2 text-gray-500 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600">
                        <UpIcon />
                    </button>
                </div>
                <article>
                    <div>
                        <header>
                            <div className="space-y-1 border-b border-slate-100 pb-10 dark:border-gray-700">
                                <dl>
                                    <div>
                                        <dt className="sr-only">Published on</dt>
                                        <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                                            <time dateTime={post.date}>{post.date}</time>
                                        </dd>
                                    </div>
                                </dl>
                                <div>
                                    <h2 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-800 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-4xl md:leading-14">
                                        {post.title}
                                    </h2>
                                </div>
                            </div>
                        </header>
                        <div
                            className="divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:divide-y-0"
                            style={{ gridTemplateRows: 'auto 1fr' }}>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0">
                                <div className="prose max-w-none pt-10 pb-8 dark:prose-invert">
                                    <p>{post.excerpt}</p>
                                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </Layout>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = await getAllPostIds();
    return {
        paths,
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { params } = ctx;
    const parsedIds = (params.id as string).split(separator());
    const post = serialize(await getPostById(parsedIds[0]));
    return {
        props: {
            post,
            themeMode: parsedIds[1] || null,
        },
    };
};
