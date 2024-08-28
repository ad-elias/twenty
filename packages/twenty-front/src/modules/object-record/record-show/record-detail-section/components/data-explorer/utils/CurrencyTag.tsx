import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(0.25)};
  padding-bottom: ${({ theme }) => theme.spacing(0.25)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(0.25)};
  // cursor: pointer;
  user-select: none;
`;

interface CurrencyTagProps {
  currencyCode?: CurrencyCode;
}

// TODO: Click to select currency

export const CurrencyTag = (props: CurrencyTagProps) => {
  return <StyledContainer>{props.currencyCode}</StyledContainer>;
};
