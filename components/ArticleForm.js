import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const TextArea = styled.textarea`
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: ${(props) => (props.cancel ? '#ccc' : '#1976d2')};
  color: #fff;

  &:hover {
    opacity: 0.9;
  }
`;
export default function ArticleForm({ onSubmit, initialData, onCancel }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [url, setUrl] = useState(initialData?.url || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verifica se onSubmit existe antes de chamar
    if (typeof onSubmit === 'function') {
      onSubmit({ title, summary, url });
      
      // Só reseta se não for uma edição
      if (!initialData) {
        setTitle('');
        setSummary('');
        setUrl('');
      }
    } else {
      console.error('onSubmit is not a function');
    }
  };
  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextArea
        placeholder="Resumo"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        required
        rows={3}
      />
      <Input
        type="url"
        placeholder="URL do artigo"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <ButtonGroup>
        <Button type="submit">{initialData ? 'Atualizar' : 'Criar'}</Button>
        {initialData && <Button type="button" cancel onClick={onCancel}>Cancelar</Button>}
      </ButtonGroup>
    </Form>
  );
}
