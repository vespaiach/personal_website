import * as React from 'react';
import NextHead from 'next/head';
import { useRouter } from 'next/router';

const HOST = 'https://www.vespaiach.com/';

interface HeadProps {
    children?: React.ReactNode;
    card?: string;
    description?: string;
    largeCard?: boolean;
    title?: string;
}

export default function Head(props: HeadProps) {
    const {
        card = 'https://www.vespaiach.com/images/nguyen_blog_card.png',
        children,
        description = "Nguyen's blog is a programming website which shares knowledge and experiences about computer programming.",
        largeCard = true,
        title = "Nguyen's blog - Programming sharing",
    } = props;
    const router = useRouter();

    return (
        <NextHead>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="twitter:card" content={largeCard ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:site" content="@vespaiach" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={card} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:url" content={`${HOST}${router.asPath}`} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={card} />
            <meta property="og:ttl" content="604800" />
            <meta name="docsearch:language" content="en" />
            <meta name="docsearch:version" content="master" />
            <link rel="shortcut icon" type="image/jpg" href="https://www.vespaiach.com/images/favicon.jpeg" />
            {children}
        </NextHead>
    );
}
