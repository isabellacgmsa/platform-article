import { getAllArticles, saveArticles } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { startScraperJob } from '@/lib/cron';

let cronStarted = false;
if (!cronStarted) {
  startScraperJob();
  cronStarted = true;
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const articles = getAllArticles();
    return res.status(200).json(articles);
  }

if (req.method === 'POST') {
  // Aceita tanto um artigo único quanto um array
  const incomingArticles = Array.isArray(req.body) ? req.body : [req.body];
  
  if (!incomingArticles.length) {
    return res.status(400).json({ message: 'No articles provided' });
  }

  const articles = getAllArticles();
  const newArticles = [];

  for (const incomingArticle of incomingArticles) {
    const { title, url, summary = 'Sem resumo', source = 'unknown', createdAt = new Date().toISOString() } = incomingArticle;

    if (!title || !url) {
      continue; // Pula artigos inválidos
    }

    // Verifica se o artigo já existe pela URL
    const alreadyExists = articles.some(article => article.url === url);
    if (alreadyExists) {
      continue;
    }

    const newArticle = {
      id: uuidv4(),
      title,
      summary,
      url,
      source,
      createdAt
    };

    articles.push(newArticle);
    newArticles.push(newArticle);
  }

  if (newArticles.length) {
    saveArticles(articles);
    return res.status(201).json({
      message: `${newArticles.length} new articles added`,
      newArticles,
      totalArticles: articles.length
    });
  }

  return res.status(200).json({
    message: 'No new articles to add',
    totalArticles: articles.length
  });
}

  res.status(405).end();
}
