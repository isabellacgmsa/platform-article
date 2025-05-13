// components/ArticleTable.js
import styled from 'styled-components';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  text-align: left;
  border-bottom: 2px solid #ddd;
  padding: 1rem;
  background-color: #f8f9fa;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  vertical-align: top;
`;

const ActionButton = styled.button`
  margin-right: 0.5rem;
  background: ${(props) => (props.delete ? '#d32f2f' : '#1976d2')};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function ArticleTable({ articles, onEdit, onDelete, isLoading }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Título</Th>
          <Th>Resumo</Th>
          <Th>Ações</Th>
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <tr key={article.id}>
            <Td>{article.title}</Td>
            <Td>{article.summary}</Td>
            <Td>
              <ActionButton 
                onClick={() => onEdit(article)}
                disabled={isLoading}
              >
                Editar
              </ActionButton>
              <ActionButton 
                delete 
                onClick={() => onDelete(article.id)}
                disabled={isLoading}
              >
                Excluir
              </ActionButton>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}