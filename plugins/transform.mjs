import { Transform } from 'stream';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';
import gfm from 'remark-gfm';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function transform() {
    // Monkey patch Transform or create your own subclass,
    // implementing `_transform()` and optionally `_flush()`
    const transformStream = new Transform({ objectMode: true });
    transformStream._transform = function (file, encoding, callback) {
        const content = file.contents.toString();
        const matterResult = matter(content);
        remark()
            .use(html, { sanitize: false })
            .use(gfm)
            .use(prism)
            .process(matterResult.content)
            .then((processedContent) => {
                file.contents = Buffer.from(processedContent.value);
                file.frontmatter = matterResult.data;
                file.frontmatter.date = formatDate(file.frontmatter.date);
                callback(null, file);
            });
    };

    return transformStream;
}
