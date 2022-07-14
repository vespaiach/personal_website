export default function StructuredData({ posts }: { posts?: SerializedPostData[] }) {
    if (!posts || !posts.length) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                    posts.map((ar) => ({
                        '@context': 'https://schema.org',
                        '@type': 'NewsArticle',
                        mainEntityOfPage: {
                            '@type': 'Webpage',
                            '@id': `https://www.vespaiach.com/posts/${ar.id}`,
                        },
                        url: `https://www.vespaiach.com/posts/${ar.id}`,
                        headline: ar.title,
                        name: ar.title,
                        datePublished: ar.date,
                        description: ar.excerpt,
                        articleBody: ar.content,
                        author: {
                            '@type': 'Person',
                            name: 'Trinh Nguyen',
                            url: 'https://www.vespaiach.com/about',
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'vespaiach',
                            url: 'https://www.vespaiach.com',
                        },
                        keywords: ar.tags.join(', '),
                    })),
                ),
            }}
        />
    );
}
