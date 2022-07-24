import { GetStaticProps } from 'next';

import Layout from '@components/Layout';
import { getAllTagsData } from '@lib/posts';
import TagList from '@components/TagList';
import PostList from '@components/PostList';

export default function Tag({
    posts,
    tag,
    tags,
    indexLayout,
}: {
    tag?: string;
    posts?: SerializedPostData[];
    tags: TagData[];
    indexLayout: boolean;
}) {
    return (
        <Layout
            title={`${indexLayout ? 'Tags List' : tag} - Nguyen's Blog`}
            description={tags.map((t) => t.name).join(',')}
            defaultBlogJsonLdOn>
            <main className="flex-1">
                <div className="flex flex-col items-start divide-y divide-gray-200 dark:divide-gray-700 mb-8 md:mt-8 md:mb-10 md:flex-row md:items-center md:space-x-6 md:divide-y-0">
                    <div className="space-x-2 pt-4 pb-4 md:pt-6 md:pb-8 md:space-y-5">
                        <h2 className="pl-0 text-3xl font-bold leading-9 tracking-tight text-gray-800 dark:text-gray-100 sm:text-4xl sm:leading-10 md:border-r-2 border-slate-100 md:pr-6 md:text-6xl md:leading-14">
                            Tags
                        </h2>
                    </div>
                    <TagList
                        selectedTag={tag}
                        tags={tags}
                        className="flex flex-wrap"
                        tagClassName="mt-2 mb-2 mr-5 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    />
                </div>
                {indexLayout ? null : <PostList posts={posts} />}
            </main>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const tags = await getAllTagsData();
    return {
        props: {
            tags,
            indexLayout: true,
        },
    };
};
