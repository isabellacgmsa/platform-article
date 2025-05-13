import { exec } from 'child_process';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { source } = req.body;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const scraperPath = path.join(process.cwd(), 'scripts', 'scraper.py');

  exec(`python ${scraperPath} ${source} ${apiUrl}/api/articles`, 
    (error, stdout, stderr) => {
      if (error) {
        console.error('Scraper error:', error);
        return res.status(500).json({ 
          error: 'Scraper failed',
          details: stderr 
        });
      }

      try {
        const result = JSON.parse(stdout);
        return res.status(200).json(result);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        return res.status(500).json({
          error: 'Invalid scraper output',
          rawOutput: stdout
        });
      }
    }
  );
}