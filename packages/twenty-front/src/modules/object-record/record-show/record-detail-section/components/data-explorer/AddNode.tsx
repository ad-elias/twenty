import {
  DataExplorerQuery,
  DataExplorerQueryNode,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';
import { useTheme } from '@emotion/react';
import { IconPlus } from 'twenty-ui';

interface AddNodeProps {
  node: DataExplorerQueryNode;
  onAdd: (newNode: DataExplorerQuery) => void;
}

export const AddNode = (props: AddNodeProps) => {
  const theme = useTheme();

  return (
    <NodeValue>
      <IconPlus size={theme.icon.size.sm} />
    </NodeValue>
  );
};
