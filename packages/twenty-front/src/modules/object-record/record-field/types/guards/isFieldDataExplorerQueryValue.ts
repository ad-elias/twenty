import { FieldJsonValue } from '@/object-record/record-field/types/FieldMetadata';
import { z } from 'zod';

export interface DataExplorerQueryNodeSource {
  type: 'source';
  childNodes?: DataExplorerQueryNode[];
  sourceObjectMetadataId?: string;
}

export interface DataExplorerQueryNodeJoin {
  type: 'join';
  childNodes: DataExplorerQueryNode[];
  fieldMetadataId?: string;
}

export interface DataExplorerQueryNodeSelect {
  type: 'select';
  childNodes?: DataExplorerQueryNode[];
  fieldMetadataId?: string;
}

export type DataExplorerQueryAggregateFunction =
  | 'COUNT'
  | 'SUM'
  | 'AVG'
  | 'MIN'
  | 'MAX';

export const dataExplorerQueryAggregateFunctions: DataExplorerQueryAggregateFunction[] =
  ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];

const dataExplorerQueryNodeAggregateFunction = z.object({
  type: z.literal('aggregateFunction'),
  aggregateFunction: z.enum(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']),
});

export type DataExplorerQueryNodeAggregateFunction = z.infer<
  typeof dataExplorerQueryNodeAggregateFunction
>;

export type DataExplorerQueryNodeWithChildren =
  | DataExplorerQueryNodeSource
  | DataExplorerQueryNodeJoin
  | DataExplorerQueryNodeSelect;

export type DataExplorerQueryNodeWithoutChildren =
  DataExplorerQueryNodeAggregateFunction;

export type DataExplorerQueryNode =
  | DataExplorerQueryNodeWithChildren
  | DataExplorerQueryNodeWithoutChildren;

const dataExplorerQueryNodeSchema: z.ZodType<DataExplorerQueryNode> = z.lazy(
  () =>
    z.union([
      dataExplorerQueryNodeJoinSchema,
      dataExplorerQueryNodeSelectSchema,
      dataExplorerQueryNodeAggregateFunction,
    ]),
);

export const dataExplorerQueryNodeSourceSchema: z.ZodType<DataExplorerQueryNodeSource> =
  z.object({
    type: z.literal('source'),
    sourceObjectMetadataId: z.string().optional(),
    childNodes: z.array(dataExplorerQueryNodeSchema).optional(),
  });

const dataExplorerQueryNodeJoinSchema: z.ZodType<DataExplorerQueryNodeJoin> =
  z.object({
    type: z.literal('join'),
    childNodes: z.array(dataExplorerQueryNodeSchema),
    fieldMetadataId: z.string().optional(),
    measure: z.literal('COUNT').optional(),
  });

const dataExplorerQueryNodeSelectSchema: z.ZodType<DataExplorerQueryNodeSelect> =
  z.object({
    type: z.literal('select'),
    childNodes: z.array(dataExplorerQueryNodeSchema).optional(),
    fieldMetadataId: z.string().optional(),
    measure: z.enum(['AVG', 'MAX', 'MIN', 'SUM']).optional(),
  });

const dataExplorerQueryGroupBySchema = z.object({
  fieldMetadataId: z.string().optional(),
  groups: z
    .array(
      z.object({
        upperLimit: z.number().optional(),
        lowerLimit: z.number().optional(),
      }),
    )
    .optional(),
  includeNulls: z.boolean().optional(),
});

const dataExplorerQueryOrderBySchema = z.object({
  fieldMetadataId: z.string().optional(),
  direction: z.enum(['ASC', 'DESC']).optional(),
});

const dataExplorerQuerySchema = z.object({
  select: dataExplorerQueryNodeSourceSchema.optional(),
  groupBys: z.array(dataExplorerQueryGroupBySchema).optional(),
  orderBy: dataExplorerQueryOrderBySchema.optional(),
  measureFieldMetadataId: z.string().optional(),
});

export type DataExplorerQuery = z.infer<typeof dataExplorerQuerySchema>;

export const isFieldDataExplorerQueryValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue =>
  dataExplorerQuerySchema.safeParse(fieldValue).success;
