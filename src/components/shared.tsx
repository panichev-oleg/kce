import styled from "styled-components";

export const ScheduleList = styled.ul`
  padding: 0.5rem 0 0 0.5rem;
  margin: 0;

  li {
    list-style: none;
    margin-bottom: 0.5rem;
  }
`;

export const Link = styled.a`
  &,
  &:hover,
  &:visited,
  &:active {
    color: blue;
    text-decoration: underline;
  }

  &:hover {
    text-decoration: none;
  }
`;

export const UnstyledLink = styled.a`
  color: inherit;
  text-decoration: none;
`;
