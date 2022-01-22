import { useEffect, useState } from 'react';
import { format } from 'date-fns';

import { listenTo } from '../lib/utils';

export function Post({ excerpt = true, post }: { excerpt?: boolean; post: PostData }): JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return listenTo(window, 'scroll', () => {
      setScrolled(document.documentElement.scrollTop > 0);
    });
  }, []);

  return (
    <article className="mb-16">
      <h2 className='font-heading text-xl text-red-900 font-bold mb-2'>{post.title}</h2>
      <p className='mb-4 font-heading'>{format(new Date(post.date), 'MMMM qq, yyyy')}</p>
      {excerpt ? (
        <p className='mb-2 font-semibold'>{post.excerpt}...</p>
      ) : (
        <div>
          <figure>
            <img src={post.avatar} />
          </figure>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      )}
      <p className="flex flex-row items-center">
        {excerpt && (
          <a href={`/posts/${post.id}`} className="underline">
            Read more
          </a>
        )}
        {!excerpt && scrolled && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo(0);
            }}
            className="read-more">
            top
          </a>
        )}
        <a
          href="https://www.facebook.com/share.php?v=4&amp;src=bm&amp;u=https://nordic-btemplates.blogspot.com/2016/09/demo-post-with-formatted-elements-and.html&amp;t=Demo post with formatted elements and comments."
          onClick={(e) => {
            e.preventDefault();
            window.open(this.href, 'sharer', 'toolbar=0,status=0,width=626,height=436');
            return false;
          }}
          className="flex items-center ml-auto mr-2"
          rel="nofollow"
          target="_blank"
          title="Share this on Twitter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M23.643 4.93708C22.808 5.30708 21.911 5.55708 20.968 5.67008C21.941 5.08787 22.669 4.17154 23.016 3.09208C22.1019 3.63507 21.1014 4.01727 20.058 4.22208C19.3564 3.47294 18.4271 2.9764 17.4143 2.80955C16.4016 2.6427 15.3621 2.81487 14.4572 3.29933C13.5524 3.78379 12.8328 4.55344 12.4102 5.48878C11.9875 6.42412 11.8855 7.47283 12.12 8.47208C10.2677 8.37907 8.45564 7.89763 6.80144 7.05898C5.14723 6.22034 3.68785 5.04324 2.51801 3.60408C2.11801 4.29408 1.88801 5.09408 1.88801 5.94608C1.88757 6.71307 2.07644 7.46832 2.43789 8.14481C2.79934 8.8213 3.32217 9.39812 3.96001 9.82408C3.22029 9.80054 2.49688 9.60066 1.85001 9.24108V9.30108C1.84994 10.3768 2.22204 11.4195 2.90319 12.2521C3.58434 13.0847 4.53258 13.656 5.58701 13.8691C4.9008 14.0548 4.18135 14.0821 3.48301 13.9491C3.78051 14.8747 4.36001 15.6841 5.14038 16.264C5.92075 16.8439 6.86293 17.1653 7.83501 17.1831C6.18484 18.4785 4.1469 19.1812 2.04901 19.1781C1.67739 19.1782 1.30609 19.1565 0.937012 19.1131C3.06649 20.4823 5.54535 21.2089 8.07701 21.2061C16.647 21.2061 21.332 14.1081 21.332 7.95208C21.332 7.75208 21.327 7.55008 21.318 7.35008C22.2293 6.69105 23.0159 5.87497 23.641 4.94008L23.643 4.93708Z"
              fill="currentColor"
            />
          </svg>
        </a>
        <a
          href="#"
          className="flex items-center mr-2"
          onClick={(e) => {
            e.preventDefault();
            window.open(
              `https://www.facebook.com/share.php?v=4&src=bm&u=/posts/${post.id}&t=${post.title}`,
              'sharer',
              'toolbar=0,status=0,width=626,height=436'
            );
            return false;
          }}
          rel="nofollow"
          target="_blank"
          title="Share this on Facebook">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 12.067C0 18.033 4.333 22.994 10 24V15.333H7V12H10V9.333C10 6.333 11.933 4.667 14.667 4.667C15.533 4.667 16.467 4.8 17.333 4.933V8H15.8C14.333 8 14 8.733 14 9.667V12H17.2L16.667 15.333H14V24C19.667 22.994 24 18.034 24 12.067C24 5.43 18.6 0 12 0C5.4 0 0 5.43 0 12.067Z"
              fill="currentColor"
            />
          </svg>
        </a>
        <a
          className="flex items-center"
          href="https://www.facebook.com/share.php?v=4&amp;src=bm&amp;u=https://nordic-btemplates.blogspot.com/2016/09/demo-post-with-formatted-elements-and.html&amp;t=Demo post with formatted elements and comments."
          onClick={(e) => {
            e.preventDefault();
            window.open(this.href, 'sharer', 'toolbar=0,status=0,width=626,height=436');
            return false;
          }}
          rel="nofollow"
          target="_blank"
          title="Share this on Linked in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1 2.838C1 2.35053 1.19365 1.88303 1.53834 1.53834C1.88303 1.19365 2.35053 1 2.838 1H21.16C21.4016 0.999608 21.6409 1.04687 21.8641 1.13907C22.0874 1.23127 22.2903 1.36661 22.4612 1.53734C22.6322 1.70807 22.7677 1.91083 22.8602 2.13401C22.9526 2.3572 23.0001 2.59643 23 2.838V21.16C23.0003 21.4016 22.9529 21.6409 22.8606 21.8642C22.7683 22.0875 22.6328 22.2904 22.462 22.4613C22.2912 22.6322 22.0884 22.7678 21.8651 22.8602C21.6419 22.9526 21.4026 23.0001 21.161 23H2.838C2.59655 23 2.35746 22.9524 2.1344 22.86C1.91134 22.7676 1.70867 22.6321 1.53798 22.4613C1.3673 22.2905 1.23193 22.0878 1.13962 21.8647C1.04731 21.6416 0.999869 21.4025 1 21.161V2.838ZM9.708 9.388H12.687V10.884C13.117 10.024 14.217 9.25 15.87 9.25C19.039 9.25 19.79 10.963 19.79 14.106V19.928H16.583V14.822C16.583 13.032 16.153 12.022 15.061 12.022C13.546 12.022 12.916 13.111 12.916 14.822V19.928H9.708V9.388ZM4.208 19.791H7.416V9.25H4.208V19.79V19.791ZM7.875 5.812C7.88105 6.08667 7.83217 6.35979 7.73124 6.61532C7.63031 6.87084 7.47935 7.10364 7.28723 7.30003C7.09511 7.49643 6.8657 7.65248 6.61246 7.75901C6.35921 7.86554 6.08724 7.92042 5.8125 7.92042C5.53776 7.92042 5.26579 7.86554 5.01255 7.75901C4.7593 7.65248 4.52989 7.49643 4.33777 7.30003C4.14565 7.10364 3.99469 6.87084 3.89376 6.61532C3.79283 6.35979 3.74395 6.08667 3.75 5.812C3.76187 5.27286 3.98439 4.75979 4.36989 4.38269C4.75539 4.00558 5.27322 3.79442 5.8125 3.79442C6.35178 3.79442 6.86961 4.00558 7.25512 4.38269C7.64062 4.75979 7.86313 5.27286 7.875 5.812V5.812Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </p>
    </article>
  );
}
