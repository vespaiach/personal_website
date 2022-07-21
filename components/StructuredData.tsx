export default function StructuredData({ post }: { post?: SerializedPostData }) {
    if (!post) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'NewsArticle',
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
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: 'vespaiach',
                        url: 'https://www.vespaiach.com',
                    },
                    keywords: post.tags.join(', '),
                }),
            }}
        />
    );
}
