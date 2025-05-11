import cron from 'node-cron';
import { spawn } from 'child_process';
import path from 'path';

export function startScraperJob() {
  cron.schedule('*/30 * * * *', () => {
    console.log('Rodando scraper automaticamente (a cada 30 minutos)...');

    const scriptPath = path.join(process.cwd(), 'scripts', 'scraper.py');

    const python = spawn('python', [scriptPath]);

    python.stdout.on('data', (data) => {
      console.log(`Scraper: ${data.toString()}`);
    });

    python.stderr.on('data', (data) => {
      console.error(`Scraper error: ${data.toString()}`);
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error(`Scraper finalizado com código ${code}`);
      }
    });
  });
}
