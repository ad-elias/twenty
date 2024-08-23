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
  measure?: 'COUNT';
}

export interface DataExplorerQueryNodeSelect {
  type: 'select';
  childNodes?: DataExplorerQueryNode[];
  fieldMetadataId?: string;
  measure?: 'AVG' | 'MAX' | 'MIN' | 'SUM';
}

const dataExplorerQueryNodeGroupBySchema = z.object({
  type: z.literal('groupBy'),
  groupBy: z.boolean().optional(),
  groups: z
    .array(
      z.object({
        upperLimit: z.number(),
        lowerLimit: z.number(),
      }),
    )
    .optional(),
  includeNulls: z.boolean().optional(),
});

const dataExplorerQueryNodeOrderBySchema = z.object({
  type: z.literal('orderBy'),
  sortBy: z.enum(['ASC', 'DESC']).optional(),
});

export type DataExplorerQueryNodeGroupBy = z.infer<
  typeof dataExplorerQueryNodeGroupBySchema
>;

export type DataExplorerQueryNodeOrderBy = z.infer<
  typeof dataExplorerQueryNodeOrderBySchema
>;

export type DataExplorerQueryNode =
  | DataExplorerQueryNodeJoin
  | DataExplorerQueryNodeSelect
  | DataExplorerQueryNodeGroupBy
  | DataExplorerQueryNodeOrderBy
  | DataExplorerQueryNodeSource;

const dataExplorerQueryNodeSchema: z.ZodType<DataExplorerQueryNode> = z.lazy(
  () =>
    z.union([
      dataExplorerQueryNodeJoinSchema,
      dataExplorerQueryNodeSelectSchema,
      dataExplorerQueryNodeGroupBySchema,
      dataExplorerQueryNodeOrderBySchema,
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

export type DataExplorerQuery = DataExplorerQueryNodeSource;

export const isFieldDataExplorerQueryValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue =>
  dataExplorerQueryNodeSourceSchema.safeParse(fieldValue).success;
