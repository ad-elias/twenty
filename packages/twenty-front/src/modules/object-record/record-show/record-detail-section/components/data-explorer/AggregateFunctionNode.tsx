import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import {
  dataExplorerQueryAggregateFunctions,
  DataExplorerQueryNodeAggregateFunction,
  DataExplorerQueryNodeJoin,
  DataExplorerQueryNodeSelect,
  DataExplorerQueryNodeSource,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { AggregateFunctionSelectItem } from '@/object-record/record-show/record-detail-section/components/data-explorer/AggregateFunctionSelectItem';
import { NodeContainer } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeContainer';
import { NodeValue } from '@/object-record/record-show/record-detail-section/components/data-explorer/NodeValue';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { useTheme } from '@emotion/react';
import { IconPlus, IconX, MAIN_COLORS, Tag, TagColor } from 'twenty-ui';

export const tagColorByAggregateFunction = Object.fromEntries(
  dataExplorerQueryAggregateFunctions.map((aggregateFunction, i) => [
    aggregateFunction,
    Object.keys(MAIN_COLORS)[i] as TagColor,
  ]),
);

export interface AggregateFunctionNodeProps {
  parentNode:
    | DataExplorerQueryNodeSource
    | DataExplorerQueryNodeJoin
    | DataExplorerQueryNodeSelect;
  node?: DataExplorerQueryNodeAggregateFunction;
  hotkeyScope: string;
  onChange: (newNode?: DataExplorerQueryNodeAggregateFunction) => void;
}

export const AggregateFunctionNode = (props: AggregateFunctionNodeProps) => {
  const theme = useTheme();

  const parentNodeId =
    props.parentNode.type === 'source'
      ? props.parentNode.sourceObjectMetadataId
      : props.parentNode.fieldMetadataId;
  const dropdownId = `data-explorer-query-aggregation-node-${parentNodeId}-${props.node?.aggregateFunction}`;

  const { closeDropdown } = useDropdown(dropdownId);

  const options = dataExplorerQueryAggregateFunctions.filter(
    (aggregateFunction) =>
      props.parentNode.type === 'select'
        ? aggregateFunction !== 'COUNT'
        : aggregateFunction === 'COUNT',
  );

  return (
    <NodeContainer>
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <NodeValue isValueEmpty={!props.node}>
            {!props.node && <IconPlus size={theme.icon.size.sm} />}
            {props.node?.aggregateFunction ? (
              <Tag
                text={props.node.aggregateFunction}
                color={
                  tagColorByAggregateFunction[props.node.aggregateFunction]
                }
              />
            ) : (
              'Select aggregation'
            )}
          </NodeValue>
        }
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuItemsContainer hasMaxHeight>
              <SelectableList
                selectableListId={FIELD_PATH_PICKER_SELECTABLE_LIST_ID}
                selectableItemIdArray={options}
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
                {options.map((aggregateFunction) => (
                  <AggregateFunctionSelectItem
                    key={aggregateFunction}
                    aggregateFunction={aggregateFunction}
                    tagColor={tagColorByAggregateFunction[aggregateFunction]}
                    onSelect={() => {
                      const newNode: DataExplorerQueryNodeAggregateFunction = {
                        type: 'aggregateFunction',
                        aggregateFunction,
                      };
                      closeDropdown();
                      props.onChange(newNode);
                    }}
                  />
                ))}
              </SelectableList>
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{ scope: props.hotkeyScope }}
      />
    </NodeContainer>
  );
};
