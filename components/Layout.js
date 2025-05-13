import styled from 'styled-components';

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1rem;
`;

export default function Layout({ children }) {
  return <Container>{children}</Container>;
}
