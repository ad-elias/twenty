import { DataExplorerQuery } from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';

export interface Chart {
  id: string;
  name: string;
  description: string;
  query: DataExplorerQuery;
  __typename: string;
}
