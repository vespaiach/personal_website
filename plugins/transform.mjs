import { Transform } from 'stream';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';
import gfm from 'remark-gfm';

export default function transform() {
    // Monkey patch Transform or create your own subclass,
    // implementing `_transform()` and optionally `_flush()`
    const transformStream = new Transform({ objectMode: true });
    /**
     * @param {Buffer|string} file
     * @param {string=} encoding - ignored if file contains a Buffer
     * @param {function(Error, object)} callback - Call this function (optionally with an
     *          error argument and data) when you are done processing the supplied chunk.
     */
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
                callback(null, file);
            });
    };

    return transformStream;
}
