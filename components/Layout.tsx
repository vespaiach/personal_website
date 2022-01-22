import Head from 'next/head';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Vespaiach - I'm a web developer."></meta>
        <link rel="stylesheet" href="/main.css" />
      </Head>
      {children}
      <footer></footer>
    </>
  );
}
