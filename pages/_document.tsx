import Script from 'next/script';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        const scripts = [];
        if (process.env.NEXT_PUBLIC_GTAG_ID) {
            scripts.push(
                <Script
                    key={1}
                    strategy="beforeInteractive"
                    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_ID}`}
                />,
            );
            scripts.push(
                <Script
                    key={2}
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                                        window.dataLayer = window.dataLayer || [];
                                        function gtag(){dataLayer.push(arguments);}
                                        gtag('js', new Date());
                                        gtag('config', '${process.env.NEXT_PUBLIC_GTAG_ID}');
                                    `,
                    }}
                />,
            );
        }

        return (
            <Html lang="en" className="scroll-smooth">
                <Head>
                    <link rel="stylesheet" href="/main.css" />
                    {scripts}
                </Head>
                <body className="bg-white text-gray-500 antialiased dark:bg-gray-900 dark:text-white">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
