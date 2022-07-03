import { GetStaticProps } from 'next';

import Layout from '@components/Layout';
import { getAllTagsData } from '@lib/posts';
import TagList from '@components/TagList';

export default function Tags({ tags }: { tags: TagData[] }) {
    return (
        <Layout title="Tags List - Nguyen's Blog">
            <main className="mb-auto">
                <div className="flex flex-col items-start divide-y divide-gray-200 dark:divide-gray-700 md:mt-24 md:flex-row md:items-center md:space-x-6 md:divide-y-0">
                    <div className="space-x-2 pt-6 pb-8 md:space-y-5">
                        <h1 className="pl-0 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:border-r-2 md:pr-6 md:text-6xl md:leading-14">
                            Tags
                        </h1>
                    </div>
                    <TagList tags={tags} />
                </div>
            </main>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const tags = await getAllTagsData();
    return {
        props: {
            tags,
        },
    };
};
