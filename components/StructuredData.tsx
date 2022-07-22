export default function StructuredData({ post }: { post?: SerializedPostData }) {
    if (!post) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    mainEntityOfPage: {
                        '@type': 'Webpage',
                        '@id': `https://www.vespaiach.com/posts/${post.id}`,
                    },
                    url: `https://www.vespaiach.com/posts/${post.id}`,
                    headline: post.title,
                    name: post.title,
                    datePublished: post.date,
                    description: post.excerpt,
                    articleBody: post.content,
                    author: {
                        '@type': 'Person',
                        name: 'Trinh Nguyen',
                        url: 'https://www.vespaiach.com/about',
                        image: {
                            '@type': 'ImageObject',
                            url: 'https://avatars.githubusercontent.com/u/8703891?v=4',
                            width: 460,
                            height: 460,
                        },
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: 'vespaiach',
                        url: 'https://www.vespaiach.com',
                        logo: {
                            '@type': 'ImageObject',
                            url: 'https://www.vespaiach.com/images/favicon.jpeg',
                            width: 40,
                            height: 40,
                        },
                    },
                    keywords: post.tags.join(', '),
                    image: {
                        '@type': 'ImageObject',
                        url: `https://www.vespaiach.com/images/${post.id}.jpg`,
                        width: 1024,
                        height: 1366,
                    },
                }),
            }}
        />
    );
}
