import { DataExplorerQueryNodeWithChildren } from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';
import { useTheme } from '@emotion/react';
import { IconPlus } from 'twenty-ui';

// UX: How to smoothly select between a field and aggregate function? Which is better, "nested" UI or "all options visible"?

interface AddNodeProps {
  parentNode: DataExplorerQueryNodeWithChildren;
  onAdd: (newNode: DataExplorerQueryNodeWithChildren) => void;
}

export const AddNode = (props: AddNodeProps) => {
  const theme = useTheme();

  return (
    <>
      <NodeValue
        onClick={() => {
          const newNode: DataExplorerQueryNodeWithChildren = {
            type: 'join',
            childNodes: [],
          };
          props.onAdd(newNode);
        }}
      >
        <IconPlus size={theme.icon.size.sm} />
        Select field
      </NodeValue>
    </>
  );
};
