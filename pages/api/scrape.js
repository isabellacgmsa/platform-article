import { spawn } from 'child_process';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const scriptPath = path.join(process.cwd(), 'scripts', 'scraper.py');

  const python = spawn('python', [scriptPath]);
  let output = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  python.on('close', (code) => {
    if (code === 0) {
      res.status(200).json({ message: 'Scraper executed successfully', output });
    } else {
      res.status(500).json({ message: 'Error running scraper', error: errorOutput });
    }
  });
}
