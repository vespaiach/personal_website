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
      <header className="bg-amber-500">
        <div className="container px-6 py-9 mb-4 font-bold">
          <h2 className="text-sm mb-1 text-slate-800">Vespaiach's Blog</h2>
          <h1 className="text-2xl text-slate-800">LEARN TO SHARE</h1>
        </div>
      </header>
      <main className="container px-6">{children}</main>

      <footer></footer>
    </>
  );
}
