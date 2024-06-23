import * as React from "react";
import styled from "styled-components";

const Container = styled.div`
  overflow: hidden;
`;

const Title = styled.div<{ isExpaned: boolean }>`
  position: relative;
  padding-left: 1rem;
  cursor: pointer;

  &::before {
    position: absolute;
    ${({ isExpaned }) => (isExpaned ? "content: '▾';" : "content: '▸';")};
    left: 0;
    bottom: 1px;
  }
`;

const Content = styled.div<{ isExpaned: boolean }>`
  height: ${({ isExpaned }) => (isExpaned ? "auto" : "0")};
  padding: 0.5rem 0 0 1rem;
`;

type Props = {
  title: string;
  children?: React.ReactNode;
};

export const Collapsible: React.FC<Props> = ({ title, children }) => {
  const [isExpanded, setIsxpanded] = React.useState(false);
  return (
    <Container>
      <Title
        isExpaned={isExpanded}
        onClick={() => setIsxpanded((isExpanded) => !isExpanded)}
      >
        {title}
      </Title>
      <Content isExpaned={isExpanded}>{children}</Content>
    </Container>
  );
};
