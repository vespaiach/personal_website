import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
      <Head>
        <link rel="stylesheet" href="/main.css" />
      </Head>
      <header className="mb-11 pb-8 pt-10">
        <div className="max-w-3xl mx-5 md:ml-20">
          <h1 className="text-red-900 text-3xl font-bold">LEARN TO SHARE</h1>
          <h2 className="text-slate-900 font-bold">
            by{' '}
            <a className="underline decoration-red-900" href="https://github.com/vespaiach">
              Vespaiach
            </a>
          </h2>
        </div>
      </header>
      <main className="max-w-3xl mx-5 md:ml-20">{children}</main>
      <footer></footer>
    </>
  );
}
