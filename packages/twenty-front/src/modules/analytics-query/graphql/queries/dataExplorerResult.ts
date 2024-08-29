import { gql } from '@apollo/client';

export const CHART_DATA = gql`
  query DataExplorerResult($dataExplorerQuery: String!) {
    dataExplorerResult(dataExplorerQuery: $dataExplorerQuery) {
      rows
      sqlQuery
    }
  }
`;
