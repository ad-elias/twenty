export type DataExplorerQueryNodeSource = {
  type: 'source';
  childNodes?: DataExplorerQueryNode[];
  sourceObjectMetadataId?: string;
};

export type DataExplorerQueryNodeJoin = {
  type: 'join';
  childNodes: DataExplorerQueryNode[];
  fieldMetadataId?: string;
};

export type DataExplorerQueryNodeSelect = {
  type: 'select';
  childNodes?: DataExplorerQueryNode[];
  fieldMetadataId?: string;
};

export type DataExplorerQueryNodeAggregateFunction = {
  type: 'aggregateFunction';
  aggregateFunction: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
};

export type DataExplorerQueryNodeWithChildren =
  | DataExplorerQueryNodeSource
  | DataExplorerQueryNodeJoin
  | DataExplorerQueryNodeSelect;

export type DataExplorerQueryNodeWithoutChildren =
  DataExplorerQueryNodeAggregateFunction;

export type DataExplorerQueryNode =
  | DataExplorerQueryNodeWithChildren
  | DataExplorerQueryNodeWithoutChildren;

export type DataExplorerQueryGroupBy = {
  fieldMetadataId?: string;
  groups?: { upperLimit: number; lowerLimit: number }[];
  includeNulls?: boolean;
};

export type DataExplorerQueryOrderBy = {
  fieldMetadataId?: string;
  direction?: 'ASC' | 'DESC';
};

export type DataExplorerQuery = {
  select?: DataExplorerQueryNodeSource;
  groupBys?: DataExplorerQueryGroupBy[];
  orderBy?: DataExplorerQueryOrderBy;
  measureFieldMetadataId?: string;
};
