import styled from '@emotion/styled';
import { ComponentProps, PropsWithChildren } from 'react';

const StyledNodeValue = styled.div<{ isValueEmpty?: boolean }>`
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};

  :hover {
    background-color: ${({ theme }) => theme.grayScale.gray15};
  }
  ${({ theme, isValueEmpty }) =>
    isValueEmpty && `color: ${theme.font.color.tertiary};`}
`;

interface NodeValueProps extends PropsWithChildren {
  isValueEmpty?: boolean;
  onClick?: ComponentProps<typeof StyledNodeValue>['onClick'];
}

export const NodeValue = (props: NodeValueProps) => (
  <StyledNodeValue isValueEmpty={props.isValueEmpty} onClick={props.onClick}>
    {props.children}
  </StyledNodeValue>
);
