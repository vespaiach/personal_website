import '@styles/prism.css';
import '@styles/main.css';

import { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <DefaultSeo
                title="Programming Knowledge Sharing"
                titleTemplate="%s | Nguyen's Blog"
                description="Nguyen's blog is a website for sharing knowledge and experiences about computer programming"
                openGraph={{
                    type: 'website',
                    locale: 'en_IE',
                    url: 'https://www.vespaiach.com/posts',
                    site_name: "Nguyen's Blog",
                    images: [
                        {
                            url: 'https://www.vespaiach.com/images/vespaiach.jpeg',
                            width: 460,
                            height: 460,
                            alt: 'Vespaiach',
                        },
                    ],
                }}
                twitter={{
                    handle: '@vespaiach',
                    site: '@vespaiach',
                    cardType: 'summary_large_image',
                }}
            />
            <Component {...pageProps} />
        </>
    );
}
