import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import {
  DataExplorerQueryNode,
  DataExplorerQueryNodeSelect,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';

import { NodeChildren } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeChildren';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';

interface SelectNodeProps {
  parentNode: DataExplorerQueryNode;
  node: DataExplorerQueryNodeSelect;
  hotkeyScope: string;
  onChange: (newNode?: DataExplorerQueryNodeSelect) => void;
}

export const SelectNode = (props: SelectNodeProps) => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const fieldMetadataItems = activeObjectMetadataItems.flatMap(
    (objectMetadata) => objectMetadata.fields,
  );

  const fieldMetadata = fieldMetadataItems.find(
    (fieldMetadata) => fieldMetadata.id === props.node.fieldMetadataId,
  );

  return (
    <NodeContainer>
      <NodeValue>{fieldMetadata?.label}</NodeValue>
      {props.node.childNodes && (
        <NodeChildren
          node={props.node}
          hotkeyScope={props.hotkeyScope}
          onChange={props.onChange}
        />
      )}
    </NodeContainer>
  );
};
