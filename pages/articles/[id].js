import styles from '@/styles/ArticleDetail.module.css';
import { useRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps(context) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/articles/${context.params.id}`);

    if (!res.ok) {
      if (res.status === 404) {
        return { notFound: true };
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const article = await res.json();
    return { props: { article } };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      notFound: true
    };
  }
}

export default function ArticleDetails({ article }) {
  const router = useRouter();

  if (!article) {
    return (
      <div className={styles.container}>
        <h1>Artigo não encontrado</h1>
        <button onClick={() => router.push('/')}>Voltar à lista</button>
      </div>
    );
  }
  return (
    <>
      <Head>
        <title>{article.title} | Plataforma de Artigos</title>
        <meta name="description" content={article.summary} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary} />
      </Head>

      <main className={styles.container}>
        <button 
          onClick={() => router.back()} 
          className={styles.backButton}
          aria-label="Voltar para a lista de artigos"
        >
          ← Voltar
        </button>

        <article className={styles.articleContent}>
          <header className={styles.articleHeader}>
            <h1 className={styles.title}>{article.title}</h1>
            {article.date && (
              <time dateTime={article.date} className={styles.date}>
                {new Date(article.date).toLocaleDateString('pt-BR')}
              </time>
            )}
          </header>

          <div className={styles.content}>
            <p className={styles.summary}>{article.summary}</p>
            
            {article.content && (
              <div 
                className={styles.fullContent}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}
          </div>

         {/* <footer className={styles.articleFooter}>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.link}
            >
              Acessar artigo original →
            </a>
          </footer>*/}
        </article>
      </main>
    </>
  );
}