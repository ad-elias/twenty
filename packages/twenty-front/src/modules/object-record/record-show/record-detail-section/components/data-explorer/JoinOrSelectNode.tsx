import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FieldSelectItem } from '@/object-record/field-path-picker/components/FieldSelectItem';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import {
  DataExplorerQueryNodeJoin,
  DataExplorerQueryNodeSelect,
  DataExplorerQueryNodeSource,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { NodeChildren } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeChildren';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';
import { isFieldMetadataSelectable } from '@/object-record/record-show/record-detail-section/components/data-explorer/utils/isFieldMetadataSelectable';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { useTheme } from '@emotion/react';
import { useMemo, useState } from 'react';
import { IconPlus, IconX, useIcons } from 'twenty-ui';

interface JoinOrSelectNodeProps {
  parentNode: DataExplorerQueryNodeSource | DataExplorerQueryNodeJoin;
  node?: DataExplorerQueryNodeJoin | DataExplorerQueryNodeSelect;
  hotkeyScope: string;
  onChange: (
    newNode?: DataExplorerQueryNodeJoin | DataExplorerQueryNodeSelect,
  ) => void;
}

export const JoinOrSelectNode = (props: JoinOrSelectNodeProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { activeObjectMetadataItems, findObjectMetadataItemById } =
    useFilteredObjectMetadataItems();
  const [searchFilter, setSearchFilter] = useState('');

  const parentNodeId =
    props.parentNode.type === 'join'
      ? props.parentNode.fieldMetadataId
      : props.parentNode.sourceObjectMetadataId;

  const dropdownId = `data-explorer-query-join-or-select-node-${parentNodeId}-${props.node?.fieldMetadataId}`;

  const { closeDropdown } = useDropdown(dropdownId);

  const fieldMetadata = activeObjectMetadataItems
    .flatMap((objectMetadata) => objectMetadata.fields)
    .find((fieldMetadata) => fieldMetadata.id === props.node?.fieldMetadataId);

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
      parentFieldMetadata?.relationDefinition?.targetObjectMetadata.id;
  } else {
    throw new Error('Invalid parent node type');
  }

  const parentObjectMetadata = findObjectMetadataItemById(
    parentObjectMetadataId,
  );

  const optionsToSelect = useMemo(
    () =>
      parentObjectMetadata?.fields.filter((fieldMetadata) => {
        const isNotSelected = props.node?.fieldMetadataId !== fieldMetadata.id;
        const labelIncludesSearchFilter = fieldMetadata.label
          .toLowerCase()
          .includes(searchFilter.toLowerCase());
        return (
          isNotSelected &&
          labelIncludesSearchFilter &&
          isFieldMetadataSelectable(fieldMetadata)
        );
      }) || [],
    [parentObjectMetadata?.fields, searchFilter, props.node?.fieldMetadataId],
  );

  const FieldMetadataIcon = getIcon(fieldMetadata?.icon);

  const noResult = false;

  return (
    <NodeContainer>
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <NodeValue isValueEmpty={!props.node}>
            {fieldMetadata ? (
              <FieldMetadataIcon size={theme.icon.size.sm} />
            ) : (
              <IconPlus size={theme.icon.size.sm} />
            )}
            {fieldMetadata?.label ?? 'Select field'}
          </NodeValue>
        }
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuSearchInput
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              autoFocus
            />
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer hasMaxHeight>
              <SelectableList
                selectableListId={FIELD_PATH_PICKER_SELECTABLE_LIST_ID}
                selectableItemIdArray={activeObjectMetadataItems.map(
                  (objectMetadata) => objectMetadata.id,
                )}
                hotkeyScope={props.hotkeyScope}
              >
                <StyledMenuItemBase
                  onClick={() => {
                    closeDropdown();
                    props.onChange(undefined);
                  }}
                >
                  <MenuItemLeftContent LeftIcon={IconX} text="Clear" />
                </StyledMenuItemBase>
                {noResult ? (
                  <MenuItem text="No result" />
                ) : (
                  optionsToSelect.map((fieldMetadata) => (
                    <FieldSelectItem
                      key={fieldMetadata.id}
                      fieldMetadata={fieldMetadata}
                      onSelect={() => {
                        const joinNode: DataExplorerQueryNodeJoin = {
                          type: 'join',
                          fieldMetadataId: fieldMetadata.id,
                          childNodes: [],
                        };
                        const selectNode: DataExplorerQueryNodeSelect = {
                          type: 'select',
                          fieldMetadataId: fieldMetadata.id,
                          childNodes: [],
                        };
                        const newNode = isFieldRelation(fieldMetadata)
                          ? joinNode
                          : selectNode;
                        closeDropdown();
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
      {props.node && (
        <NodeChildren
          node={props.node}
          hotkeyScope={props.hotkeyScope}
          onChange={(newNode) => {
            props.onChange(newNode);
          }}
        />
      )}
    </NodeContainer>
  );
};
