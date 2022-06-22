import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '@components/Layout';
import { getAllTagsData } from '@lib/posts';

export default function Tags({ tags }: { tags: TagData[] }) {
    return (
        <Layout>
            <Head>
                <title>Tags - Vespaiach</title>
            </Head>
            <main className="mb-auto">
                <div className="flex flex-col items-start divide-y divide-gray-200 dark:divide-gray-700 md:mt-24 md:flex-row md:items-center md:space-x-6 md:divide-y-0">
                    <div className="space-x-2 pt-6 pb-8 md:space-y-5">
                        <h1 className="pl-0 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:border-r-2 md:pr-6 md:text-6xl md:leading-14">
                            Tags
                        </h1>
                    </div>
                    <div className="flex max-w-lg flex-wrap">
                        {tags.map((tag, i) => (
                            <div key={i} className="mt-2 mb-2 mr-5">
                                <Link href={`/tags/${tag.name}`}>
                                    <a className="mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                                        {tag.name}
                                    </a>
                                </Link>
                                <Link href={`/tags/${tag.name}`}>
                                    <a className="-ml-2 text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">
                                        ({tag.count})
                                    </a>
                                </Link>
                            </div>
                        ))}
                    </div>
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
