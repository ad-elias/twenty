import {
  DataExplorerQuery,
  DataExplorerQueryNodeOrderBy,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';

interface OrderByNodeProps {
  dataExplorerQuery: DataExplorerQuery;
  node: DataExplorerQueryNodeOrderBy;
  nodeIndexPath: number[];
}

export const OrderByNode = (props: OrderByNodeProps) => {
  return (
    <NodeContainer>
      <NodeValue>Order by</NodeValue>
    </NodeContainer>
  );
};
