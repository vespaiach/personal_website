import matter from 'gray-matter';
import { Article } from './Article.js';

export class MarkdownParser {
  parse(rawContent) {
    const { data: frontMatter, content: rawContentBody } = matter(rawContent);
    return new Article({
      title: frontMatter.title,
      date: new Date(frontMatter.date),
      excerpt: frontMatter.excerpt,
      github: frontMatter.github,
      tags: frontMatter.tags,
      rawContent: rawContentBody,
    });
  }
}
