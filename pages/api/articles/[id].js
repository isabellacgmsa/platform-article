import { getAllArticles, saveArticles, getArticleById } from '@/lib/db';

export default function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const article = getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
      
      return res.status(200).json(article);
    }

    let articles = getAllArticles();
    const articleIndex = articles.findIndex(article => article.id === id);

    if (articleIndex === -1) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (req.method === 'PUT') {
      const { title, summary, url } = req.body;

      if (!title || !summary || !url) {
        return res.status(400).json({ message: 'Missing fields' });
      }

      articles[articleIndex] = {
        ...articles[articleIndex],
        title,
        summary,
        url,
        updatedAt: new Date().toISOString()
      };

      saveArticles(articles);
      return res.status(200).json(articles[articleIndex]);
    }

    if (req.method === 'DELETE') {
      articles.splice(articleIndex, 1);
      saveArticles(articles);
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}