import { DataExplorerQueryAggregateFunction } from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { tagColorByAggregateFunction } from '@/object-record/record-show/record-detail-section/components/data-explorer/AggregateFunctionNode';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { Tag } from 'twenty-ui';

interface AggregateFunctionSelectItemProps {
  aggregateFunction: DataExplorerQueryAggregateFunction;
  onSelect: (aggregateFunction: DataExplorerQueryAggregateFunction) => void;
}

export const AggregateFunctionSelectItem = (
  props: AggregateFunctionSelectItemProps,
) => {
  return (
    <StyledMenuItemBase onClick={() => props.onSelect(props.aggregateFunction)}>
      <Tag
        text={props.aggregateFunction}
        color={tagColorByAggregateFunction[props.aggregateFunction]}
      />
    </StyledMenuItemBase>
  );
};
