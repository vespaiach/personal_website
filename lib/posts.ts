import { open } from 'node:fs/promises';
import { opendir } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';

import { format } from './utils';

const postsDirectory = path.join(process.cwd(), 'docs');
let posts: PostData[];

async function getAllFiles() {
    const dir = await opendir(postsDirectory);
    const files: string[] = [];

    for await (const dirent of dir) {
        if (dirent.isFile) {
            files.push(dirent.name);
        }
    }

    return files;
}

async function getAllPosts() {
    if (posts) return posts;

    let filehandle;

    const files = await getAllFiles();
    posts = [];

    try {
        for (let file of files) {
            filehandle = await open(path.join(postsDirectory, file), 'r');
            const fileContent = await filehandle.readFile({ encoding: 'utf8' });
            filehandle.close();

            const matterResult = matter(fileContent);

            const processedContent = await remark()
                .use(html, { sanitize: false })
                .use(prism)
                .process(matterResult.content);
            const content = processedContent.toString();
            const id = file.replace(/\.md$/, '');

            posts.push(toPostData(matterResult.data, { id, content }));
        }

        return posts;
    } catch (e) {
        throw e;
    } finally {
        await filehandle?.close();
    }
}

export async function getSortedPostsData() {
    const allPostsData = await getAllPosts();

    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export async function getAllTagsData(): Promise<TagData[]> {
    const counter: Record<string, number> = {};

    for (let post of await getAllPosts()) {
        for (let tag of post.tags) {
            counter[tag] = counter[tag] || 0;
            counter[tag] += 1;
        }
    }

    return Object.entries(counter)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, count]) => ({
            name,
            count,
        }));
}

export async function getAllPostIds() {
    const posts = await getAllPosts();
    return posts.map((p) => {
        return {
            params: {
                id: p.id,
            },
        };
    });
}

export async function getPostById(id: string) {
    return (await getAllPosts()).find((p) => p.id === id);
}

export async function getPostsByTag(tag: string) {
    return (await getAllPosts()).filter((p) => p.tags.includes(tag));
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

export function serialize(d: PostData): SerializedPostData {
    return {
        ...d,
        date: format(d.date),
    };
}
