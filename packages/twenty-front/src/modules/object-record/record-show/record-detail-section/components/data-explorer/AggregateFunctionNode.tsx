import {
  DataExplorerQueryNode,
  DataExplorerQueryNodeAggregateFunction,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';

interface AggregateFunctionNodeProps {
  parentNode: DataExplorerQueryNode;
  node: DataExplorerQueryNodeAggregateFunction;
  hotkeyScope: string;
  onChange: (newNode?: DataExplorerQueryNodeAggregateFunction) => void;
}

export const AggregateFunctionNode = (props: AggregateFunctionNodeProps) => {
  return (
    <NodeContainer>
      <NodeValue>Aggregate function</NodeValue>
    </NodeContainer>
  );
};
