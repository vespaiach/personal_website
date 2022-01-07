import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const name = '[Your Name]';
export const siteTitle = 'Next.js Sample Website';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
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
        <p className="sub-blog-name">LEARN, SHARE,...REPEAT</p>
      </header>
      <nav>
        <ul>
          <li>
            <Link href="/">HOME</Link>
          </li>
          <li>
            <Link href="/">ABOUT</Link>
          </li>
          <li>
            <Link href="/">FACEBOOK</Link>
          </li>
          <li>
            <Link href="/">TWITTER</Link>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
      <style>{`
      .container { max-width: 48rem; margin: 0 auto; }
      .blog-name { font-size: 4rem;font-weight: 700; line-height: normal; margin: 0 0 12px 0;   }
      .sub-blog-name { font-size: 2rem; font-weight: 300; line-height: 1.4; margin: 0 0 16px 0; }
      .sub-blog-name, .blog-name { text-align: center; font-family: 'Amatic SC',sans-serif; }
      nav { margin-bottom: 24px; }
      nav ul { margin: 0; padding: 0; list-style: none; display: flex; }
      nav ul li + li { margin-left: 12px; }
      nav ul li a { font-weight: 400; font-size: 1rem; }
      `}</style>
    </div>
  );
}
