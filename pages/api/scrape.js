import { exec } from 'child_process';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { source } = req.body;
  if (!source) {
    return res.status(400).json({ error: 'Fonte não especificada' });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const scraperPath = path.join(process.cwd(), 'scripts', 'scraper.py');

  exec(`python ${scraperPath} ${source} ${apiUrl}/api/articles`, (error, stdout, stderr) => {
    if (error) {
      console.error('Erro ao executar o scraper:', error);
      return res.status(500).json({
        error: 'Falha ao executar o scraper',
        details: stderr || error.message,
      });
    }

    try {
      if (!stdout) {
        return res.status(500).json({
          error: 'O scraper não retornou dados',
          rawOutput: '',
        });
      }

      const result = JSON.parse(stdout);

      const newArticles = Array.isArray(result.articles) ? result.articles.length : 0;

      return res.status(200).json({
        ...result,
        newArticles,
      });

    } catch (parseError) {
      console.error('Erro ao interpretar a saída do scraper:', parseError);
      return res.status(500).json({
        error: 'Saída inválida do scraper',
        rawOutput: stdout,
      });
    }
  });
}
