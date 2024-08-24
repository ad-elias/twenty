import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FieldSelectItem } from '@/object-record/field-path-picker/components/FieldSelectItem';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import {
  DataExplorerQueryNode,
  DataExplorerQueryNodeJoin,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { NodeChildren } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeChildren';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { IconTallymarks, useIcons } from 'twenty-ui';

interface JoinNodeProps {
  parentNode: DataExplorerQueryNode;
  node: DataExplorerQueryNodeJoin;
  hotkeyScope: string;
  onChange: (newNode?: DataExplorerQueryNodeJoin) => void;
}

export const JoinNode = (props: JoinNodeProps) => {
  const { getIcon } = useIcons();
  const { activeObjectMetadataItems, findObjectMetadataItemById } =
    useFilteredObjectMetadataItems();

  const fieldMetadata = activeObjectMetadataItems
    .flatMap((objectMetadata) => objectMetadata.fields)
    .find((fieldMetadata) => fieldMetadata.id === props.node.fieldMetadataId);

  let parentObjectMetadataId;
  if (props.parentNode.type === 'source') {
    parentObjectMetadataId = props.parentNode.sourceObjectMetadataId;
  } else if (props.parentNode.type === 'join') {
    const parentFieldMetadata = activeObjectMetadataItems
      ?.flatMap((objectMetadata) => objectMetadata.fields)
      .find(
        (fieldMetadata) =>
          fieldMetadata.id ===
          (props.parentNode as DataExplorerQueryNodeJoin).fieldMetadataId,
      );
    parentObjectMetadataId =
      parentFieldMetadata?.fromRelationMetadata?.toFieldMetadataId ===
      props.parentNode.fieldMetadataId
        ? parentFieldMetadata?.toRelationMetadata?.fromObjectMetadata.id
        : parentFieldMetadata?.fromRelationMetadata?.toObjectMetadata.id;
  } else {
    throw new Error('Invalid parent node type');
  }

  const parentObjectMetadata = findObjectMetadataItemById(
    parentObjectMetadataId,
  );

  const FieldMetadataIcon = getIcon(fieldMetadata?.icon);

  const noResult = false;

  return (
    <NodeContainer>
      <Dropdown
        dropdownId="data-explorer-query-source-node"
        clickableComponent={
          <NodeValue>
            <FieldMetadataIcon />
            {fieldMetadata?.label}
          </NodeValue>
        }
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuSearchInput onChange={() => {}} autoFocus />
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer hasMaxHeight>
              <SelectableList
                selectableListId={FIELD_PATH_PICKER_SELECTABLE_LIST_ID}
                selectableItemIdArray={activeObjectMetadataItems.map(
                  (objectMetadata) => objectMetadata.id,
                )}
                hotkeyScope={props.hotkeyScope}
              >
                <StyledMenuItemBase>
                  <MenuItemLeftContent LeftIcon={IconTallymarks} text="Clear" />
                </StyledMenuItemBase>
                {noResult ? (
                  <MenuItem text="No result" />
                ) : (
                  parentObjectMetadata?.fields.map((fieldMetadata) => (
                    <FieldSelectItem
                      key={fieldMetadata.id}
                      fieldMetadata={fieldMetadata}
                      onSelect={() => {
                        const newNode: DataExplorerQueryNodeJoin = {
                          ...props.node,
                          fieldMetadataId: fieldMetadata.id,
                        };
                        props.onChange(newNode);
                      }}
                    />
                  ))
                )}
              </SelectableList>
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{ scope: props.hotkeyScope }}
      />
      <NodeChildren
        node={props.node}
        hotkeyScope={props.hotkeyScope}
        onChange={props.onChange}
      />
    </NodeContainer>
  );
};
