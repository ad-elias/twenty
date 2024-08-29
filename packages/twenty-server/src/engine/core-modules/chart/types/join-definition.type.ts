import { JoinTarget } from 'src/engine/core-modules/chart/types/join-target.type';

export interface JoinDefinition {
  tableName: string;
  tableAlias: string;
  fieldName?: string;

  joinTarget?: JoinTarget;

  withQueries?: string[];
}
