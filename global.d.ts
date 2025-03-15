declare global {
  interface Post {
    title: string
    date: string
    excerpt: string
    slug: string
    tags: string[]
    github: string
    content: string
  }
	type ShortPost = Omit<Post, 'content'>
}

// This line ensures that the file is treated as a module, which is necessary for the global declaration to work correctly.
export {}
