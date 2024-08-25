import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import { DataExplorerQueryNodeSource } from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { NodeChildren } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeChildren';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';
import { ObjectSelectItem } from '@/object-record/record-show/record-detail-section/components/data-explorer/ObjectSelectItem';
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

interface SourceNodeProps {
  node?: DataExplorerQueryNodeSource;
  hotkeyScope: string;
  onChange: (newNode?: DataExplorerQueryNodeSource) => void;
}

export const SourceNode = (props: SourceNodeProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const dropdownId = 'data-explorer-query-source-node';
  const { closeDropdown } = useDropdown(dropdownId);

  const [searchFilter, setSearchFilter] = useState('');

  const { activeObjectMetadataItems, findObjectMetadataItemById } =
    useFilteredObjectMetadataItems();

  const optionsToSelect = useMemo(
    () =>
      activeObjectMetadataItems.filter((objectMetadata) => {
        return (
          objectMetadata.id !== props.node?.sourceObjectMetadataId &&
          objectMetadata.labelPlural
            .toLowerCase()
            .includes(searchFilter.toLowerCase())
        );
      }) || [],
    [
      activeObjectMetadataItems,
      searchFilter,
      props.node?.sourceObjectMetadataId,
    ],
  );

  const sourceObjectMetadata = props.node?.sourceObjectMetadataId
    ? findObjectMetadataItemById(props.node?.sourceObjectMetadataId)
    : undefined;

  const ObjectMetadataIcon = getIcon(sourceObjectMetadata?.icon);

  const noResult = false;

  return (
    <NodeContainer>
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <NodeValue>
            {sourceObjectMetadata ? (
              <ObjectMetadataIcon size={theme.icon.size.sm} />
            ) : (
              <IconPlus size={theme.icon.size.sm} />
            )}
            {sourceObjectMetadata?.labelPlural ?? 'Select object'}
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
                  optionsToSelect?.map((objectMetadata) => (
                    <ObjectSelectItem
                      key={objectMetadata.id}
                      objectMetadata={objectMetadata}
                      onSelect={() => {
                        closeDropdown();
                        const newNode = {
                          type: 'source' as const,
                          sourceObjectMetadataId: objectMetadata.id,
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
      {props.node && (
        <NodeChildren
          node={props.node}
          hotkeyScope={props.hotkeyScope}
          onChange={props.onChange}
        />
      )}
    </NodeContainer>
  );
};
