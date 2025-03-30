import { marked } from 'marked';

export class HtmlTransformer {
  transform(article) {
    article.content = marked.parse(article.rawContent);
    return article;
  }
}
