import pjson from '../package.json' with { type: 'json' };

let conn;
const ensureHandlerReady = async () => {
  if (!conn) {
    conn = await import(`../handlers/${pjson.handlers.layout}.js`);
  }
};

export const getIndexLayout = async () => {
  await ensureHandlerReady();
  return await conn.getIndexLayout();
};

export const getPostLayout = async () => {
  await ensureHandlerReady();
  return await conn.getPostLayout();
};
