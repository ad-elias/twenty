import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldSelectItem } from '@/object-record/field-path-picker/components/FieldSelectItem';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import {
  DataExplorerQuery,
  DataExplorerQueryNode,
  DataExplorerQueryNodeJoin,
  DataExplorerQueryNodeSelect,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';
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
import { useState } from 'react';
import { IconPlus, IconX, useIcons } from 'twenty-ui';

const getSelectedFieldMetadataIds = (
  nodes: DataExplorerQueryNode[],
  fieldMetadataIds: string[] = [],
): string[] => {
  if (!nodes || nodes.length === 0) return fieldMetadataIds;

  const selectedFieldMetadataIds = nodes
    .filter(
      (node): node is DataExplorerQueryNodeJoin | DataExplorerQueryNodeSelect =>
        node.type === 'join' || node.type === 'select',
    )
    .filter((node) =>
      node.childNodes?.every(
        (childNode) => childNode.type !== 'join' && childNode.type !== 'select',
      ),
    )
    .map((node) => node.fieldMetadataId)
    .filter(
      (fieldMetadataId): fieldMetadataId is string =>
        fieldMetadataId !== undefined,
    );

  const childNodes = nodes.flatMap((node) =>
    node.type !== 'aggregateFunction' ? (node.childNodes ?? []) : [],
  );

  return getSelectedFieldMetadataIds(childNodes, [
    ...fieldMetadataIds,
    ...selectedFieldMetadataIds,
  ]);
};

interface SelectedFieldDropdownProps {
  dataExplorerQuery?: DataExplorerQuery;
  fieldMetadataId?: string;
  hotkeyScope: string;
  onChange: (newFieldMetadataId?: string) => void;
  dropdownId: string;
}

export const SelectedFieldDropdown = (props: SelectedFieldDropdownProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { closeDropdown } = useDropdown(props.dropdownId);

  const [searchFilter, setSearchFilter] = useState('');

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const fieldMetadataItemsById: Record<string, FieldMetadataItem> =
    Object.fromEntries(
      activeObjectMetadataItems
        .flatMap((objectMetadata) => objectMetadata.fields)
        .map((fieldMetadata) => [fieldMetadata.id, fieldMetadata]),
    );

  const selectedFieldMetadataItems = props.dataExplorerQuery?.select
    ? getSelectedFieldMetadataIds([props.dataExplorerQuery.select]).map(
        (fieldMetadataId) => fieldMetadataItemsById[fieldMetadataId],
      )
    : [];

  const optionsToSelect =
    selectedFieldMetadataItems.filter((fieldMetadata) => {
      return (
        fieldMetadata.id !== props.fieldMetadataId &&
        fieldMetadata.label.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }) || [];

  if (!props.dataExplorerQuery?.select) return 'Select a field first';

  const fieldMetadata = props.fieldMetadataId
    ? fieldMetadataItemsById[props.fieldMetadataId]
    : undefined;

  const FieldMetadataIcon = getIcon(fieldMetadata?.icon);

  const noResult = false;
  return (
    <NodeContainer>
      <Dropdown
        dropdownId={props.dropdownId}
        clickableComponent={
          <NodeValue isValueEmpty={!fieldMetadata}>
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
                  optionsToSelect?.map((fieldMetadata) => (
                    <FieldSelectItem
                      key={fieldMetadata.id}
                      fieldMetadata={fieldMetadata}
                      onSelect={(fieldMetadataId) => {
                        closeDropdown();
                        props.onChange(fieldMetadataId);
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
    </NodeContainer>
  );
};
