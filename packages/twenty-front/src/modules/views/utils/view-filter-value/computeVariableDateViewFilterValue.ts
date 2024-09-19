import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/utils/view-filter-value/resolveDateViewFilterValue';

export const computeVariableDateViewFilterValue = (
  direction: VariableDateViewFilterValueDirection,
  amount: number,
  unit: VariableDateViewFilterValueUnit,
) => `${direction}_${amount}_${unit}`;