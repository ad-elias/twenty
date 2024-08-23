import {
  DataExplorerQuery,
  DataExplorerQueryNodeGroupBy,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';

interface GroupByNodeProps {
  dataExplorerQuery: DataExplorerQuery;
  node: DataExplorerQueryNodeGroupBy;
  nodeIndexPath: number[];
}

export const GroupByNode = (props: GroupByNodeProps) => {
  return (
    <NodeContainer>
      <NodeValue>Group by</NodeValue>
    </NodeContainer>
  );
};
