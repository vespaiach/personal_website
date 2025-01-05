import pjson from '../package.json' with { type: 'json' };

let conn;
const ensureHandlerReady = async () => {
  if (!conn) {
    conn = await import(`../handlers/${pjson.handlers.markdown}.js`);
  }
};

const months = ['Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const formatDate = (date) => {
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * @returns [{ title: string, slug: string, date: string, tags: string[] }]
 */
export const getListOfArticleMetadata = async () => {
  await ensureHandlerReady();
  const list = await conn.getListOfArticleMetadata();
  list.sort((a, b) => b.date - a.date);
  return list.map(item => ({ ...item, date: formatDate(item.date) }));
};

/**
 * @returns { title: string, slug: string, date: string, tags: string[], content: string }
 */
export const getArticleDetail = async (slug) => {
  await ensureHandlerReady();
  return await conn.getArticleDetail(slug);
};
