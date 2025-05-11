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
    const { title, summary, url } = req.body;

    if (!title || !summary || !url) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const newArticle = {
      id: uuidv4(),
      title,
      summary,
      url,
      createdAt: new Date().toISOString()
    };

    const articles = getAllArticles();
    articles.push(newArticle);
    saveArticles(articles);

    return res.status(201).json(newArticle);
  }

  res.status(405).end();
}
