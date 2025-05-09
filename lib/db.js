import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'articles.json');

export function getAllArticles() {
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileData);
}

export function saveArticles(articles) {
  fs.writeFileSync(dataFilePath, JSON.stringify(articles, null, 2), 'utf8');
}

export function getArticleById(id) {
  const articles = getAllArticles();
  return articles.find(article => article.id === id);
}
