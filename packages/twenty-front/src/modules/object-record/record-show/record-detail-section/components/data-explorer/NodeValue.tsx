import styled from '@emotion/styled';
import { ComponentProps, PropsWithChildren } from 'react';

const StyledNodeValue = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
  :hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

interface NodeValueProps extends PropsWithChildren {
  onClick?: ComponentProps<typeof StyledNodeValue>['onClick'];
}

export const NodeValue = (props: NodeValueProps) => (
  <StyledNodeValue onClick={props.onClick}>{props.children}</StyledNodeValue>
);
