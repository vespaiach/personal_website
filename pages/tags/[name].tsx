import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';

import { getAllTagsData, getPostsByTag, mixTagsWithTheme, serialize } from '@lib/posts';
import Layout from '@components/Layout';
import PostList from '@components/PostList';
import TagList from '@components/TagList';
import { separator, tagIndexPrefix } from '@lib/utils';
import Tags from '.';

export default function Tag({
    posts,
    tag,
    tags,
    indexLayout,
}: {
    tag: string;
    posts: SerializedPostData[];
    tags: TagData[];
    indexLayout: boolean;
}) {
    if (indexLayout) return <Tags tags={tags} />;

    return (
        <Layout>
            <Head>
                <title>{`Tags: ${tag} - Vespaiach`}</title>
            </Head>
            <main className="flex-1">
                <div className="flex flex-col items-start divide-y divide-gray-200 dark:divide-gray-700 mb-8 md:mt-8 md:mb-10 md:flex-row md:items-center md:space-x-6 md:divide-y-0">
                    <div className="space-x-2 pt-4 pb-4 md:pt-6 md:pb-8 md:space-y-5">
                        <h2 className="pl-0 text-3xl font-bold leading-9 tracking-tight text-gray-800 dark:text-gray-100 sm:text-4xl sm:leading-10 md:border-r-2 border-slate-100 md:pr-6 md:text-6xl md:leading-14">
                            Tags
                        </h2>
                    </div>
                    <TagList tags={tags} selected={tag} />
                </div>
                <PostList posts={posts} />
            </main>
        </Layout>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const tags = mixTagsWithTheme(await getAllTagsData());
    return {
        paths: tags.map((t) => ({
            params: {
                name: t.name,
            },
        })),
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const parsedNames = (params.name as string).split(separator());
    const tags = await getAllTagsData();
    let posts = null;
    let indexLayout = false;

    if (parsedNames[0] === tagIndexPrefix) {
        indexLayout = true;
    } else {
        indexLayout = false;
        posts = (await getPostsByTag(parsedNames[0])).map(serialize);
    }

    return {
        props: {
            posts,
            tags,
            tag: params.name,
            indexLayout,
            themeMode: parsedNames[1] || null,
        },
    };
};
