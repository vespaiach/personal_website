import * as React from 'react';
import NextHead from 'next/head';
import { useRouter } from 'next/router';

const HOST = 'https://www.vespaiach.com/';

interface HeadProps {
    children?: React.ReactNode;
    image?: string;
    description?: string;
    title?: string;
    tags?: string[];
    publishedAt?: string;
    modifiedAt?: string;
    cardWidth?: string;
    cardHeight?: string;
}

export default function Head(props: HeadProps) {
    const {
        image = null,
        cardWidth = null,
        cardHeight = null,
        children,
        description = "Nguyen's blog is a programming website which shares knowledge and experiences about computer programming.",
        title = "Nguyen's blog - Programming sharing",
        publishedAt = null,
        modifiedAt = null,
        tags = [],
    } = props;
    const router = useRouter();
    const articleURL = `${HOST}${router.asPath}`;

    return (
        <NextHead>
            <title>{title}</title>
            <meta name="description" content={description} />

            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="author" content="Trinh Nguyen" />

            <meta name="twitter:site" content="@vespaiach" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:url" content={articleURL} />
            {image && <meta name="twitter:image" content="summary_large_image" />}
            {image && <meta name="twitter:image" content={`${HOST}images/${image}`} />}

            <meta property="og:site_name" content="Nguyen's Blog" />
            <meta property="og:type" content="article" />
            <meta property="og:title" content={title} />
            <meta property="og:url" content={articleURL} />
            <meta property="og:description" content={description} />
            <meta property="og:ttl" content="604800" />
            {image && <meta property="og:image" content={`${HOST}images/${image}`} />}
            {cardWidth && <meta property="og:image:width" content={cardWidth} />}
            {cardHeight && <meta property="og:image:height" content={cardHeight} />}

            <meta property="article:publisher" content="https://twitter.com/vespaiach" />
            {publishedAt && <meta property="article:published_time" content={publishedAt} />}
            {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
            {tags.map((tag) => (
                <meta key={tag} property="article:tag" content={tag} />
            ))}

            <meta name="docsearch:language" content="en" />
            <meta name="docsearch:version" content="master" />
            <link rel="shortcut icon" type="image/jpg" href="https://www.vespaiach.com/images/favicon.jpeg" />
            <link rel="canonical" href={articleURL} />
            {children}
        </NextHead>
    );
}
