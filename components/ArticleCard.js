import styled from 'styled-components';

const Card = styled.div`
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
`;

const Title = styled.h2`
  font-size: 1.2rem;
  color: #1976d2;
`;

const Summary = styled.p`
  font-size: 0.95rem;
  color: #333;
  margin: 0.5rem 0;
`;

const LinkButton = styled.a`
  display: inline-block;
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #1976d2;
  text-decoration: underline;

  &:hover {
    color: #155aa8;
  }
`;
import Link from 'next/link';

const ArticleCard = ({ article, href }) => {
  return (
    <Link href={href} passHref legacyBehavior>
      <div className="cardWrapper">
 <Card>
      <Title>{article.title}</Title>
      <Summary>{article.summary}</Summary>
      <LinkButton href={article.url} target="_blank" rel="noopener noreferrer">
        Mais
      </LinkButton>
    </Card>      </div>
    </Link>
  );
};
export default ArticleCard; 