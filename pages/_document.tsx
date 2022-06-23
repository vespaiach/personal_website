import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html lang="en" className="scroll-smooth">
                <Head>
                    <link rel="stylesheet" href="/main.css" />
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
