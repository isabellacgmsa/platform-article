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
        throw new Error(data.error || 'Failed to run scraper');
      }

      setResult({
        success: true,
        message: `Scraping completed from ${source}`,
        newArticles: data.newArticles,
        source: data.source
      });

      onScrapeComplete?.();

    } catch (error) {
      setResult({
        success: false,
        message: error.message,
        details: error.details
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
        {/*<option value="hashnode">Hashnode</option>*/}
        <option value="medium">Medium</option>
      </select>

      <button
        onClick={handleScrape}
        disabled={isLoading}
        className={styles.scrapeButton}
      >
        {isLoading ? 'Scraping...' : 'Scrape Articles'}
      </button>

      {result && (
        <div className={result.success ? styles.scrapeSuccess : styles.scrapeError}>
          <p><strong>{result.message}</strong></p>
          {result.success && (
            <p>New articles added: {result.newArticles}</p>
          )}
          {!result.success && result.details && (
            <p>Details: {JSON.stringify(result.details)}</p>
          )}
        </div>
      )}
    </div>
  );
}