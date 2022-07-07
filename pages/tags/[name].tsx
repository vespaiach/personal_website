import { GetStaticProps, GetStaticPaths } from 'next';

import { getAllTagsData, getPostsByTag, mixTagsWithTheme, serialize } from '@lib/posts';
import { separator, tagIndexPrefix } from '@lib/utils';
import TagComponent from '.';

export default function Tag(props: {
    tag: string;
    posts: SerializedPostData[];
    tags: TagData[];
    indexLayout: boolean;
}) {
    return <TagComponent {...props} />;
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
            tag: parsedNames[0],
            indexLayout,
            themeMode: parsedNames[1] || null,
        },
    };
};
