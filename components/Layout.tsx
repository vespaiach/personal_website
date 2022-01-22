import Head from 'next/head';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/main.css" />
      </Head>
      {children}
      <footer></footer>
    </>
  );
}
