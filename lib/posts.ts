import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';

const postsDirectory = path.join(process.cwd(), 'docs');

export function getSortedPostsData() {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        const id = fileName.replace(/\.md$/, '');

        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        const matterResult = matter(fileContents);

        return toPostData(matterResult.data, { id });
    });

    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames.map((fileName) => {
        return {
            params: {
                id: fileName.replace(/\.md$/, ''),
            },
        };
    });
}

export async function getPost(id: string) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);

    const processedContent = await remark()
        .use(html, { sanitize: false })
        .use(prism)
        .process(matterResult.content);
    const content = processedContent.toString();

    return toPostData(matterResult.data, { id, content });
}

// https://github.com/vercel/next.js/issues/13209#issuecomment-633149650
function toPostData(
    data: Record<string, unknown>,
    { id, content }: { id: string; content?: string },
): PostData {
    return {
        ...data,
        id,
        content,
        tags: data.tags ? (data.tags as string).split(',').map((t) => t.trim()) : [],
        date: new Date(data.date as string),
    } as unknown as PostData;
}
