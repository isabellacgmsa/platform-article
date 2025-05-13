import ArticleCard from '@/components/ArticleCard';
import styles from '@/styles/Home.module.css';
import Head from 'next/head';

export async function getServerSideProps() {
  try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    const articles = await res.json();
    return { props: { articles } };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { props: { articles: [] } };
  }
}

export default function Home({ articles }) {
  return (
    <>
      <Head>
        <title>Plataforma de Artigos</title>
        <meta name="description" content="Artigos técnicos sobre desenvolvimento" />
      </Head>
      
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Plataforma de Artigos</h1>
          <a href="/admin" className={styles.adminButton}>
            Administração
          </a>
        </header>

        {articles.length > 0 ? (
          <div className={styles.articlesGrid}>
            {articles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                href={`/articles/${article.id}`}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>Nenhum artigo encontrado</p>
        )}
      </main>
    </>
  );
}