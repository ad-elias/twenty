import { DataExplorerQueryAggregateFunction } from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { Tag, TagColor } from 'twenty-ui';

interface AggregateFunctionSelectItemProps {
  aggregateFunction: DataExplorerQueryAggregateFunction;
  tagColor: TagColor;
  onSelect: (aggregateFunction: DataExplorerQueryAggregateFunction) => void;
}

export const AggregateFunctionSelectItem = (
  props: AggregateFunctionSelectItemProps,
) => {
  return (
    <StyledMenuItemBase onClick={() => props.onSelect(props.aggregateFunction)}>
      <Tag text={props.aggregateFunction} color={props.tagColor} />
    </StyledMenuItemBase>
  );
};
