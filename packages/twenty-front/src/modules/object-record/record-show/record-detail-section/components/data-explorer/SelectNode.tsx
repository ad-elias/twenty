import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import {
  DataExplorerQuery,
  DataExplorerQueryNodeSelect,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { NodeChildren } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeChildren';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';

interface SelectNodeProps {
  dataExplorerQuery: DataExplorerQuery;
  node: DataExplorerQueryNodeSelect;
  nodeIndexPath: number[];
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
          dataExplorerQuery={props.dataExplorerQuery}
          childNodes={props.node.childNodes}
          nodeIndexPath={props.nodeIndexPath}
        />
      )}
    </NodeContainer>
  );
};
