import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useChartDataQuery } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled(Table)`
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTableCell = styled(TableCell)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  &:last-child {
    border-right: none;
  }
`;

const StyledParagraph = styled.p`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

interface SQLResultTableProps {
  targetableObject: ActivityTargetableObject;
}

export const SQLResultTable = (props: SQLResultTableProps) => {
  const { data: dataExplorerResult, loading: dataExplorerResultLoading } =
    useChartDataQuery({
      variables: {
        chartId: props.targetableObject.id,
      },
    });

  const rows: { [columnName: string]: any }[] =
    dataExplorerResult?.dataExplorerQueryResult.result;

  const isLoading: boolean = dataExplorerResultLoading;

  if (isLoading) return <SkeletonLoader />;

  const columnNames = Object.keys(rows?.[0]);

  const rowValues = rows
    ?.slice(0, 100)
    .map((row) => columnNames.map((columnName) => row[columnName]));

  return (
    <StyledTableContainer>
      <StyledTable>
        <TableRow>
          {columnNames.map((columnName) => (
            <TableHeader key={columnName}>{columnName}</TableHeader>
          ))}
        </TableRow>
        <TableBody>
          {rowValues?.map((row, i) => (
            <TableRow key={i}>
              {row.map((value) => (
                <StyledTableCell key={value}>{value}</StyledTableCell>
              ))}
            </TableRow>
          ))}
          {rows?.length > 100 && (
            <TableRow>
              <TableCell>
                <StyledParagraph>Showing first 100 rows.</StyledParagraph>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};
