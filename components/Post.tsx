export function Post({ short = true, post }: { short?: boolean; post: PostData }): JSX.Element {
  return (
    <article>
      <h2>{post.title}</h2>
      <p>
        Written on <strong>{post.date}</strong>
      </p>
      {short ? (
        <p className="collapsed">{post.excerpt}...</p>
      ) : (
        <div className="expanded">
          <figure>
            <img src={post.avatar} />
          </figure>
          {post.content}
        </div>
      )}
      <p className="share">
        <span>Share:</span>
        <a
          href="https://www.facebook.com/share.php?v=4&amp;src=bm&amp;u=https://nordic-btemplates.blogspot.com/2016/09/demo-post-with-formatted-elements-and.html&amp;t=Demo post with formatted elements and comments."
          onClick={(e) => {
            e.preventDefault();
            window.open(this.href, 'sharer', 'toolbar=0,status=0,width=626,height=436');
            return false;
          }}
          rel="nofollow"
          target="_blank"
          title="Share this on Facebook">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0 12.067C0 18.033 4.333 22.994 10 24V15.333H7V12H10V9.333C10 6.333 11.933 4.667 14.667 4.667C15.533 4.667 16.467 4.8 17.333 4.933V8H15.8C14.333 8 14 8.733 14 9.667V12H17.2L16.667 15.333H14V24C19.667 22.994 24 18.034 24 12.067C24 5.43 18.6 0 12 0C5.4 0 0 5.43 0 12.067Z"
              fill="currentColor"
            />
          </svg>
        </a>
        <a href="#" className="read-more">
          Read more
        </a>
      </p>
      <style jsx>{`
        article + article {
          margin-top: 72px;
        }
        article {
          color: hsl(0, 0%, 25%);
        }
        article h2,
        article strong {
          color: hsl(0, 0%, 0%);
        }
        article h2 {
          font-size: 3.3125rem;
          line-height: 1.3em;
          font-weight: 700;
          font-family: 'Amatic SC', sans-serif;
          margin: 0 0 24px 0;
        }
        article h2 + p {
          margin: 0 0 32px 0;
        }
        article .share {
          margin: 16px 0 0 0;
          display: flex;
          align-items: center;
        }
        article .share a {
          margin-left: 8px;
        }
        article .share a {
          color: hsl(0, 0%, 0%);
        }
        article .share a.read-more {
          color: hsl(0, 0%, 25%);
          margin-left: auto;
        }
      `}</style>
    </article>
  );
}
