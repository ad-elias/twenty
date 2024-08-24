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
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { useTheme } from '@emotion/react';
import { IconPlus, IconTallymarks, useIcons } from 'twenty-ui';

interface SourceNodeProps {
  node?: DataExplorerQueryNodeSource;
  hotkeyScope: string;
  onChange: (newNode?: DataExplorerQueryNodeSource) => void;
}

export const SourceNode = (props: SourceNodeProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { activeObjectMetadataItems, findObjectMetadataItemById } =
    useFilteredObjectMetadataItems();

  const sourceObjectMetadata = props.node?.sourceObjectMetadataId
    ? findObjectMetadataItemById(props.node?.sourceObjectMetadataId)
    : undefined;

  const SourceObjectMetadataIcon = getIcon(sourceObjectMetadata?.icon);

  const noResult = false;

  return (
    <NodeContainer>
      <Dropdown
        dropdownId="data-explorer-query-source-node"
        clickableComponent={
          <NodeValue>
            {sourceObjectMetadata ? (
              <SourceObjectMetadataIcon />
            ) : (
              <IconPlus size={theme.icon.size.md} />
            )}
            {sourceObjectMetadata?.labelPlural ?? 'Select object'}
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
                  activeObjectMetadataItems?.map((objectMetadata) => (
                    <ObjectSelectItem
                      key={objectMetadata.id}
                      objectMetadata={objectMetadata}
                      onSelect={() => {
                        const newNode = {
                          ...props.node,
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
