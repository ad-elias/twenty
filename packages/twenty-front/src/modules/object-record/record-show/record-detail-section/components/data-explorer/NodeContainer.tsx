import styled from '@emotion/styled';
import { PropsWithChildren } from 'react';

const StyledNodeContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type NodeContainerProps = PropsWithChildren;

export const NodeContainer = (props: NodeContainerProps) => (
  <StyledNodeContainer>{props.children}</StyledNodeContainer>
);
