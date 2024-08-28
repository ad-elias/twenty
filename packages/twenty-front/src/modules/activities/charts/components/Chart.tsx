import styled from '@emotion/styled';
import { ResponsiveBar } from '@nivo/bar';

import { Chart as ChartType } from '@/activities/charts/types/Chart';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useTheme } from '@emotion/react';
import { useChartDataQuery } from '~/generated/graphql';

const StyledHint = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(2)};
  text-align: center;
  margin: auto;
`;

const StyledHintGroupBy = styled.span`
  display: inline;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledChartContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

interface ChartProps {
  targetableObject: ActivityTargetableObject;
}

export const Chart = (props: ChartProps) => {
  const theme = useTheme();

  const { record: chart, loading: chartLoading } = useFindOneRecord<ChartType>({
    objectRecordId: props.targetableObject.id,
    objectNameSingular: props.targetableObject.targetObjectNameSingular,
  });

  const { data: chartDataResponse, loading: chartDataLoading } =
    useChartDataQuery({
      variables: {
        chartId: props.targetableObject.id,
      },
    });
  const chartResult = chartDataResponse?.dataExplorerQueryResult.result;

  const loading: boolean = chartLoading || chartDataLoading;

  if (loading) return <SkeletonLoader />;

  if (!chart) throw new Error('Could not load chart');

  if (!chart.query.groupBys?.[0].fieldMetadataId) {
    return (
      <StyledHint>
        <StyledHintGroupBy>Group by</StyledHintGroupBy> a field to display chart
      </StyledHint>
    );
  }

  if (!chartResult) return;

  const margin = theme.spacingMultiplicator * 12;

  const indexBy = Object.keys(chartResult[0]).find((key) => key !== 'measure');

  return (
    <StyledChartContainer>
      <ResponsiveBar
        data={chartResult}
        keys={['measure']}
        indexBy={indexBy}
        margin={{ top: margin, right: margin, bottom: margin, left: margin }}
        padding={0.4}
        valueScale={{ type: 'linear' }}
        animate={true}
        enableLabel={false}
      />
    </StyledChartContainer>
  );
};
