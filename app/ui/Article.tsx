'use client'

import Link from 'next/link'
import { useSyntaxHighlight } from '@/shared/hooks/useSyntaxHighlight'
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

export default function Article({ post }: { post: Post }) {
	useSyntaxHighlight()
  return (
    <main>
      <Link href="/">
        <small>← back</small>
      </Link>
      <h1 className="!mt-3">{post.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: post.content }} />
      <Link href="/">
        <small>← back</small>
      </Link>
    </main>
  )
}
