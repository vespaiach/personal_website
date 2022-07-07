declare module 'remark-html' {
    const html: any;
    export default html;
}

declare interface PostData {
    github?: string;
    excerpt: string;
    content: string;
    date: Date;
    title: string;
    tags: string[];
    id: string;
}

declare type SerializedPostData = Omit<PostData, 'date'> & {
    date: string;
};

declare interface TagData {
    name: string;
    count?: number;
}
