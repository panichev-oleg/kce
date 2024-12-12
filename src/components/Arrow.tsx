import * as React from "react";
import styled from "styled-components";

const Arrow = styled.span<{ disabled?: boolean }>`
  padding: 0 0.5rem;
  ${({ disabled = false }) => disabled && "opacity: .2"}
`;

type Props = {
  disabled?: boolean;
};
export const ArrowRight: React.FC<Props> = ({ disabled = false }) => {
  return <Arrow disabled={disabled}>▸</Arrow>;
};

export const ArrowLeft: React.FC<Props> = ({ disabled = false }) => {
  return <Arrow disabled={disabled}>◂</Arrow>;
};
