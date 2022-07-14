/** @type {import('next-sitemap').IConfig} */
const urls = {};
const config = {
    siteUrl: 'https://vespaiach.com',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    transform: async (config, path) => {
        const paths = path.split('----');

        if (!paths.length || urls[paths[0]]) {
            return null;
        }

        urls[paths[0]] = true;

        return {
            loc: paths[0],
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
            alternateRefs: config.alternateRefs ?? [],
        };
    },
};

module.exports = config;
