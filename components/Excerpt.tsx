import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

import { listenTo } from '../lib/utils';
import { Share } from './Share';

export function Excerpt({ post }: { post: PostData }): JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return listenTo(window, 'scroll', () => {
      setScrolled(document.documentElement.scrollTop > 0);
    });
  }, []);

  return (
    <article className="mb-16">
      <h2 className="font-heading text-xl text-red-900 font-bold mb-2">{post.title}</h2>
      <p className="mb-4 font-heading">{format(new Date(post.date), 'MMMM qq, yyyy')}</p>
      <p className="mb-2 font-semibold">{post.excerpt}</p>
      <p className="flex flex-row items-center">
        <Link href={`/posts/${post.id}`}>
          <span className='underline cursor-pointer'>Read more</span>
        </Link>
        <Share link={`https://vespaiach.com/posts/${post.id}`} title={post.title} />
      </p>
    </article>
  );
}
