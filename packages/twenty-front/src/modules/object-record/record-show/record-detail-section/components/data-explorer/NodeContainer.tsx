import styled from '@emotion/styled';
import { PropsWithChildren } from 'react';

const StyledNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type NodeContainerProps = PropsWithChildren;

export const NodeContainer = (props: NodeContainerProps) => (
  <StyledNodeContainer>{props.children}</StyledNodeContainer>
);
