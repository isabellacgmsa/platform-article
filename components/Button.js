import styled from 'styled-components';
import Link from 'next/link';

const StyledButton = styled.a`
  background-color: #1976d2;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  transition: 0.2s ease;

  &:hover {
    background-color: #155aa8;
  }
`;

export default function Button({ href, children }) {
  return (
    <Link href={href} passHref legacyBehavior>
      <StyledButton>{children}</StyledButton>
    </Link>
  );
}
