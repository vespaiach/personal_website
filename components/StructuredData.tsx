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
                        headline: ar.excerpt,
                        name: ar.title,
                        datePublished: ar.date,
                        articleBody: ar.content,
                        author: {
                            '@type': 'Person',
                            name: 'Trinh Nguyen',
                            url: 'https://www.vespaiach.com/about',
                        },
                    })),
                ),
            }}
        />
    );
}
