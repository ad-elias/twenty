import { gql } from '@apollo/client';

export const CHART_DATA = gql`
  query ChartData($chartId: String!) {
    dataExplorerQueryResult(chartId: $chartId) {
      result
      sqlQuery
    }
  }
`;
