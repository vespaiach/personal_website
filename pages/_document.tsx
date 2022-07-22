import Script from 'next/script';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { cx } from '@lib/utils';
import StructuredData from '@components/StructuredData';

/**
 * Todo: Giving StructuredData component inside Layout component didn't work. Need to investigate more
 * Temporarily move it to Document
 */
class MyDocument extends Document {
    render() {
        const themeMode = this.props.__NEXT_DATA__.props.pageProps['themeMode'];
        const post = this.props.__NEXT_DATA__.props.pageProps['post'];
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
            <Html lang="en" className={cx('scroll-smooth', themeMode)}>
                <Head>
                    {scripts}
                    {post ? <StructuredData post={post} /> : null}
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
