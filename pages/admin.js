import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchArticles } from '@/lib/api'; // Importe a função
import ArticleTable from '@/components/ArticleTable';
import ArticleForm from '@/components/ArticleForm';
import Modal from '@/components/Modal';
import { ModalActions, ModalButton } from '@/components/Modal';
import styles from '@/styles/Admin.module.css';
import ScrapeButton from '@/components/ScrapeButton';

export default function Admin() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

   const loadArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchArticles(); 
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

    useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setArticles(data);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleSave = async (articleData) => {
    try {
      setIsLoading(true);
      const method = editingArticle ? 'PUT' : 'POST';
      const url = editingArticle
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/articles/${editingArticle.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/articles`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      if (!res.ok) throw new Error('Falha ao salvar artigo');

      const savedArticle = await res.json();

      setArticles(prevArticles =>
        editingArticle
          ? prevArticles.map(a => a.id === savedArticle.id ? savedArticle : a)
          : [...prevArticles, savedArticle]
      );

      setEditingArticle(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setArticleToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles/${articleToDelete}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Falha ao deletar artigo');

      setArticles(prevArticles => prevArticles.filter(a => a.id !== articleToDelete));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (article) => {
    setEditingArticle(article);
  };


  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando artigos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Erro ao carregar artigos</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  return (
    <main className={styles.container}>
      <button className={styles.backButton} onClick={() => router.push('/')}>
        ← Voltar
      </button>

      <ScrapeButton onScrapeComplete={() => {
        fetchArticles();
      }} />
      <h1 className={styles.title}>Administração de Artigos</h1>
  <button
        onClick={() => setShowCreateModal(true)}
        className={styles.createButton}
      >
        + Criar Novo Artigo
      </button>
      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.tableSection}>
        <ArticleTable
          articles={articles}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </section>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <h2 style={{ marginBottom: '1rem' }}>Criar Novo Artigo</h2>
        <ArticleForm
          onSubmit={(articleData) => {
            handleSave(articleData);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal isOpen={!!editingArticle} onClose={() => setEditingArticle(null)}>
        <h2>{editingArticle ? 'Editar Artigo' : 'Novo Artigo'}</h2>
        <ArticleForm
          onSubmit={handleSave}
          initialData={editingArticle}
          onCancel={() => setEditingArticle(null)}
        />
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h2>Confirmar Exclusão</h2>
        <p>Tem certeza que deseja excluir este artigo?</p>
        <ModalActions>
          <ModalButton onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </ModalButton>
          <ModalButton primary onClick={confirmDelete}>
            {isLoading ? 'Excluindo...' : 'Confirmar'}
          </ModalButton>
        </ModalActions>
      </Modal>
    </main>
  );
}