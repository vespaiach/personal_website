import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const name = '[Your Name]';
export const siteTitle = 'Next.js Sample Website';

export default function Layout({
  children,
  github,
  showSearch = true,
}: {
  showSearch?: boolean;
  github?: string;
  children: React.ReactNode;
}) {
  const [lookupMode, setLookupMode] = useState(false);
  const [search, setSearch] = useState<string>('');
  const searchRef = useRef(null);

  useEffect(() => {
    if (lookupMode && searchRef.current) searchRef.current.focus();
  }, [searchRef.current, lookupMode]);

  return (
    <>
      <div className="outer">
        <div className="container">
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta name="description" content="Learn how to build a personal website using Next.js" />
            <meta name="og:title" content={siteTitle} />
            <meta name="twitter:card" content="summary_large_image" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="crossorigin" />
            <link
              href="https://fonts.googleapis.com/css?family=Amatic+SC:400,700|Dosis:400,500,700&amp;subset=latin,latin-ext"
              rel="stylesheet"
              type="text/css"
            />
          </Head>
          <header>
            <h1 className="blog-name">vespaiach</h1>
            <p className="sub-blog-name">LEARN, SHARE, ...LOOP</p>
          </header>
          <nav>
            <ul>
              <li>
                <Link href="/">HOME</Link>
              </li>
              <li>
                <Link href="/">ABOUT</Link>
              </li>
            </ul>
            <div style={{ marginLeft: 'auto' }} />
            {github ? (
              <a href={github} className="github" title="View on Github">
                <svg
                  style={{ fill: 'currentColor' }}
                  focusable="false"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  aria-label="fontSize small">
                  <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0012 1.27"></path>
                </svg>
              </a>
            ) : (
              showSearch && (
                <>
                  {lookupMode && (
                    <input type="text" ref={searchRef} className="search" onChange={(e) => setSearch(e.target.value)} />
                  )}
                  <button
                    className="icon-button"
                    onClick={() => {
                      setLookupMode(!lookupMode);
                      setSearch('');
                    }}>
                    {lookupMode ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" fill="none" />
                        <path
                          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                          fill="currentColor"></path>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" fill="none" />
                        <path
                          d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                          fill="currentColor"></path>
                      </svg>
                    )}
                  </button>
                </>
              )
            )}
          </nav>
          <main>{children}</main>
        </div>
      </div>

      <footer>
        <div className="footer-contain">
          <div>
            <section>
              <h3 className="footer-head">ABOUT</h3>
              <img src="/images/vespa.jpeg" style={{ float: 'left', margin: '0 18px 18px 0' }} /> <p>Hi there 👋</p>
              <p style={{ clear: 'both' }}>
                I'm an enthusiastic web developer. I love doing websites and delivering them with beautiful interfaces
                and high qualification.
              </p>
            </section>
            <section>
              <h3 className="footer-head">POPULAR POSTS</h3>
              <p>Hi there 👋</p>
              <p>
                I'm an enthusiastic web developer. I love doing websites and delivering them with beautiful interfaces
                and high qualification.
              </p>
            </section>
          </div>
          <div>
            <section>
              <h3 className="footer-head">TAGS</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li>
                  <a>CSS</a>
                </li>
                <li>
                  <a>JAVASCRIPT</a>
                </li>
                <li>
                  <a>REACT</a>
                </li>
              </ul>
            </section>
          </div>
        </div>
        <p style={{ textAlign: 'center' }}>Copyright © 2022 Vespaich</p>
      </footer>

      <style jsx>{`
        footer section {
          max-width: 190px;
          margin-bottom: 64px;
        }
        .footer-head {
          font-weight: 700;
          font-family: 'Amatic SC', sans-serif;
          font-size: 1.875rem;
          color: hsl(0, 0%, 0%);
          border-bottom: 2px solid hsl(0, 0%, 0%);
        }
        .outer {
          background: #fff;
        }
        footer {
          padding: 38px 18px 0 18px;
        }
        footer:after {
          text-align: center;
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
        }
        .footer-contain {
          display: grid;
          grid: auto-flow / 60% 40%;
          grid-gap: 18px;
        }
        @media screen and (max-width: 380px) {
          .footer-contain {
            display: block;
          }
        }
        .container,
        .footer-contain {
          padding-left: 18px;
          padding-right: 18px;
          max-width: 48rem;
          margin: 0 auto;
          position: relative;
        }
        .container {
          max-width: 48rem;
          padding-top: 42px;
          padding-bottom: 90px;
          margin: 0 auto;
          position: relative;
        }
        .blog-name {
          font-size: 4rem;
          font-weight: 700;
          line-height: normal;
          margin: 0 0 12px 0;
        }
        .sub-blog-name {
          font-size: 2rem;
          font-weight: 300;
          line-height: 1.4;
          margin: 0 0 16px 0;
        }
        .sub-blog-name,
        .blog-name {
          text-align: center;
          font-family: 'Amatic SC', sans-serif;
        }
        nav {
          margin: 38px 0 38px 0;
          display: flex;
          position: relative;
        }
        nav ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
        }
        nav ul li + li {
          margin-left: 12px;
        }
        nav ul li a {
          font-weight: 400;
          font-size: 1rem;
        }
        .search {
          border: none;
          outline: none;
          border-bottom: 1px solid hsl(0, 0%, 79%);
          width: 180px;
          color: hsl(0, 0%, 40%);
        }
        a.github svg {
          width: 18px;
          height: 18px;
          display: inline-block;
          fill: currentColor;
        }
      `}</style>
    </>
  );
}
