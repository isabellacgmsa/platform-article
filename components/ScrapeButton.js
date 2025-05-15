import { useState } from 'react';
import styles from '@/styles/Admin.module.css';

export default function ScrapeButton({ onScrapeComplete }) {
  const [source, setSource] = useState('devto');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScrape = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao executar o scraper');
      }

      setResult({
        success: true,
        message: `Busca finalizada na fonte: ${source}`,
        newArticles: data.newArticles,
        source: data.source
      });

      onScrapeComplete?.();

    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao buscar artigos',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.scrapeContainer}>
      <select
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isLoading}
        className={styles.sourceSelect}
      >
        <option value="devto">DEV.to</option>
        <option value="nodesource">Nodesource</option>
        <option value="medium">Medium</option>

      </select>

      <button
        onClick={handleScrape}
        disabled={isLoading}
        className={styles.scrapeButton}
      >
        {isLoading ? 'Buscando artigos...' : 'Buscar artigos'}
      </button>

      {result && (
        <div className={result.success ? styles.scrapeSuccess : styles.scrapeError}>
          {result.success ? (
            <>
              <p><strong>{result.message}</strong></p>
              {result.newArticles > 0 ? (
                <p>Novos artigos adicionados: {result.newArticles}</p>
              ) : (
                <p>Nenhum artigo novo foi encontrado.</p>
              )}
            </>
          ) : (
            <>
              <p><strong>{result.message}</strong></p>
              {result.details && (
                <p>Detalhes: {result.details}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
