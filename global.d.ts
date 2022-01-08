declare module 'remark-html' {
  const html: any;
  export default html;
}

declare interface PostData {
  github?: string;
  excerpt: string;
  avatar?: string;
  content: string;
  date: string;
  title: string;
  id: string;
}
