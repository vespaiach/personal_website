import express from 'express';
import _ from 'lodash';
import { getIndexLayout, getPostLayout } from './layout.js';
import { getListOfArticleMetadata, getArticleDetail } from './db.js';

const app = express()
const port = 3333

app.get('/', async (__, res) => {
  const [layout, listOfArticleMetadata] = await Promise.all([getIndexLayout(), getListOfArticleMetadata()]);
  res.send(_.template(layout)({ listOfArticleMetadata }));
})

app.get('/:slug', async (req, res) => {
  const [layout, article] = await Promise.all([getPostLayout(), getArticleDetail(req.params.slug)]);
  res.send(_.template(layout)({ article }));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})