import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DataExplorerResult } from 'src/engine/core-modules/chart/dtos/data-explorer-result.dto';
import { AliasPrefix } from 'src/engine/core-modules/chart/types/alias-prefix.type';
import {
  DataExplorerQuery,
  DataExplorerQueryNode,
  DataExplorerQueryNodeJoin,
  DataExplorerQueryNodeSelect,
} from 'src/engine/core-modules/chart/types/chart-query';
import { CommonTableExpressionDefinition } from 'src/engine/core-modules/chart/types/common-table-expression-definition.type';
import { JoinDefinition } from 'src/engine/core-modules/chart/types/join-definition.type';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

interface NodeLike {
  fieldMetadataId?: string;
  childNodes?: NodeLike[];
  [key: string]: any;
}

@Injectable()
export class ChartService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  private async getRelationMetadata(
    workspaceId: string,
    fieldMetadataId?: string,
  ) {
    if (!fieldMetadataId) return;
    const [relationMetadata] = await this.relationMetadataRepository.find({
      where: [
        {
          fromFieldMetadataId: fieldMetadataId,
        },
        {
          toFieldMetadataId: fieldMetadataId,
        },
      ],
      relations: [
        'fromObjectMetadata',
        'toObjectMetadata',
        'fromFieldMetadata',
        'toFieldMetadata',
        'fromObjectMetadata.fields',
        'toObjectMetadata.fields',
      ],
    });

    if (relationMetadata instanceof NotFoundException) throw relationMetadata;

    return relationMetadata;
  }

  private async getOppositeObjectMetadata(
    relationMetadata: RelationMetadataEntity,
    objectMetadata: ObjectMetadataEntity,
  ) {
    const oppositeObjectMetadata =
      relationMetadata?.fromObjectMetadataId === objectMetadata.id
        ? relationMetadata?.toObjectMetadata
        : relationMetadata?.fromObjectMetadata;

    if (!oppositeObjectMetadata) throw new Error();

    return oppositeObjectMetadata;
  }

  private computeJoinTableAlias(aliasPrefix: AliasPrefix, i: number) {
    return `table_${aliasPrefix}_${i}`;
  }

  private async getQueryRelation(
    workspaceId: string,
    dataSourceSchemaName: string,
    objectMetadata: ObjectMetadataEntity,
    index: number,
    aliasPrefix: AliasPrefix,
    oppositeObjectMetadata: ObjectMetadataEntity,
    relationMetadata: RelationMetadataEntity,
    joinTargetQueryRelation: JoinDefinition,
    isLastRelationField?: boolean,
    measureFieldMetadata?: FieldMetadataEntity,
  ): Promise<JoinDefinition | undefined> {
    const fromIsExistingTable =
      relationMetadata?.fromObjectMetadataId === objectMetadata.id;
    const toJoinFieldName = computeColumnName(
      relationMetadata.toFieldMetadata.name,
      {
        isForeignKey: true,
      },
    );
    const fromJoinFieldName = 'id';

    const baseTableName = computeObjectTargetTable(oppositeObjectMetadata);

    const commonTableExpressionDefinition =
      isLastRelationField && measureFieldMetadata
        ? await this.getCommonTableExpressionDefinition(
            dataSourceSchemaName,
            baseTableName,
            measureFieldMetadata,
          )
        : undefined;

    const rightTableName =
      commonTableExpressionDefinition?.resultSetName ?? baseTableName;

    switch (relationMetadata?.relationType) {
      case RelationMetadataType.ONE_TO_MANY: {
        return {
          tableName: rightTableName,
          tableAlias: this.computeJoinTableAlias(aliasPrefix, index),
          fieldName: fromIsExistingTable ? toJoinFieldName : fromJoinFieldName,
          joinTarget: {
            tableAlias:
              index === 0
                ? joinTargetQueryRelation.tableAlias
                : this.computeJoinTableAlias(aliasPrefix, index - 1),
            fieldName: fromIsExistingTable
              ? fromJoinFieldName
              : toJoinFieldName,
          },
          withQueries: commonTableExpressionDefinition
            ? [commonTableExpressionDefinition.withQuery]
            : undefined,
        };
      }
      default:
        throw new Error(
          `Chart query construction is not implemented for relation type '${relationMetadata?.relationType}'`,
        );
    }
  }

  private async getQueryRelations(
    dataSourceSchemaName: string,
    workspaceId: string,
    sourceObjectMetadata: ObjectMetadataEntity,
    aliasPrefix: AliasPrefix,
    sourceQueryRelation: JoinDefinition,
    relationFieldMetadataIds?: string[],
    measureFieldMetadata?: FieldMetadataEntity,
  ) {
    if (!relationFieldMetadataIds || relationFieldMetadataIds.length === 0)
      return [];
    let objectMetadata = sourceObjectMetadata;
    const queryRelations: JoinDefinition[] = [];

    for (let i = 0; i < relationFieldMetadataIds.length; i++) {
      const fieldMetadataId = relationFieldMetadataIds[i];

      const relationMetadata = await this.getRelationMetadata(
        workspaceId,
        fieldMetadataId,
      );

      if (!relationMetadata) break;

      const oppositeObjectMetadata = await this.getOppositeObjectMetadata(
        relationMetadata,
        objectMetadata,
      );

      const joinTargetQueryRelation =
        queryRelations[i - 1] ?? sourceQueryRelation;

      const isLastRelationField = i === relationFieldMetadataIds.length - 1;

      const queryRelation = await this.getQueryRelation(
        workspaceId,
        dataSourceSchemaName,
        objectMetadata,
        i,
        aliasPrefix,
        oppositeObjectMetadata,
        relationMetadata,
        joinTargetQueryRelation,
        isLastRelationField,
        measureFieldMetadata,
      );

      if (!queryRelation) break;

      queryRelations.push(queryRelation);
      objectMetadata = oppositeObjectMetadata;
    }

    return queryRelations;
  }

  private getJoinClauses(
    dataSourceSchema: string,
    chartQueryRelations: JoinDefinition[],
  ): string[] {
    return chartQueryRelations.map((queryRelation, i) => {
      if (!queryRelation.joinTarget) {
        throw new Error('Missing join target');
      }

      return `JOIN ${queryRelation.withQueries && queryRelation.withQueries.length > 0 ? '' : `"${dataSourceSchema}".`}"${queryRelation.tableName}" "${queryRelation.tableAlias}" ON "${queryRelation.joinTarget.tableAlias}"."${queryRelation.joinTarget.fieldName}" = "${queryRelation.tableAlias}"."${
        queryRelation.fieldName
      }"`;
    });
  }

  private getTargetSelectColumn(
    chartQueryMeasure?: 'COUNT' | 'AVG' | 'SUM' | 'MIN' | 'MAX',
    qualifiedColumn?: string,
  ) {
    if (
      !chartQueryMeasure ||
      (!qualifiedColumn && chartQueryMeasure !== 'COUNT')
    ) {
      return;
    }

    switch (chartQueryMeasure) {
      case 'COUNT':
        return 'COUNT(*) as measure';
      case 'AVG':
        return `AVG(${qualifiedColumn}) as measure`;
      case 'MIN':
        return `MIN(${qualifiedColumn}) as measure`;
      case 'MAX':
        return `MAX(${qualifiedColumn}) as measure`;
      case 'SUM':
        return `SUM(${qualifiedColumn}) as measure`;
    }
  }

  private async getFieldMetadata(workspaceId, fieldMetadataId) {
    if (!fieldMetadataId) return;

    return (
      (await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: fieldMetadataId,
        },
      })) ?? undefined
    );
  }

  private async getQualifiedColumn(
    workspaceId: string,
    targetQueryRelations: JoinDefinition[],
    sourceTableName: string,
    relationFieldMetadataIds?: string[],
    measureFieldMetadata?: FieldMetadataEntity,
  ) {
    const lastTargetRelationFieldMetadataId =
      relationFieldMetadataIds?.[relationFieldMetadataIds?.length - 1];

    const lastTargetRelationFieldMetadata = await this.getFieldMetadata(
      workspaceId,
      lastTargetRelationFieldMetadataId,
    );

    const columnName =
      measureFieldMetadata?.name ?? lastTargetRelationFieldMetadata?.name;

    const lastQueryRelation: JoinDefinition | undefined =
      targetQueryRelations[targetQueryRelations.length - 1];
    const tableAlias = lastQueryRelation?.tableAlias ?? sourceTableName;

    return `"${tableAlias}"."${columnName}"`;
  }

  private getCommonTableExpressionDefinition(
    dataSourceSchemaName: string,
    baseTableName: string,
    fieldMetadata: FieldMetadataEntity,
  ): CommonTableExpressionDefinition | undefined {
    const resultSetName = `${baseTableName}_cte`;

    switch (fieldMetadata.type) {
      case FieldMetadataType.CURRENCY:
        return {
          resultSetName,
          withQuery: `
            WITH "${resultSetName}" AS (
              SELECT
                *,
                "${fieldMetadata.name}AmountMicros" / 1000000.0 *
                CASE "${fieldMetadata.name}CurrencyCode"
                  WHEN 'EUR' THEN 1.10
                  WHEN 'GBP' THEN 1.29
                  WHEN 'USD' THEN 1.00
                  -- TODO: Get rates from external API and cache them
                  ELSE 1.0
                END AS "${fieldMetadata.name}"
              FROM
                "${dataSourceSchemaName}"."${baseTableName}"
            )
          `,
        };
    }
  }

  private getCommonTableExpressionDefinitionsForTable(
    dataSourceSchemaName: string,
    tableName: string,
    fieldMetadataEntities: FieldMetadataEntity[],
  ) {
    const commonTableExpressionDefinitions = fieldMetadataEntities.reduce(
      (commonTableExpressionDefinitions, fieldMetadataEntity) => {
        const previousCommonTableExpressionDefinition: CommonTableExpressionDefinition =
          commonTableExpressionDefinitions[
            commonTableExpressionDefinitions.length - 1
          ];

        const baseTableName =
          previousCommonTableExpressionDefinition?.resultSetName ?? tableName;

        const newCommonTableExpressionDefinition =
          this.getCommonTableExpressionDefinition(
            dataSourceSchemaName,
            baseTableName,
            fieldMetadataEntity,
          );

        if (!newCommonTableExpressionDefinition)
          return commonTableExpressionDefinitions;

        return [
          ...commonTableExpressionDefinitions,
          newCommonTableExpressionDefinition,
        ];
      },
      [] as CommonTableExpressionDefinition[],
    );

    return commonTableExpressionDefinitions;
  }

  private getCommonTableExpressionDefinitionsFromLeafMetadataEntities(
    dataSourceSchemaName: string,
    leafFieldMetadataEntities: FieldMetadataEntity[],
  ) {
    const leafFieldMetadataEntitiesByTableName =
      leafFieldMetadataEntities.reduce(
        (leafFieldMetadataEntitiesByTableName, fieldMetadataEntity) => {
          const tableName = computeObjectTargetTable(
            fieldMetadataEntity.object,
          );

          return {
            ...leafFieldMetadataEntitiesByTableName,
            [tableName]: [
              ...(leafFieldMetadataEntitiesByTableName[tableName] ?? []),
              fieldMetadataEntity,
            ],
          };
        },
        {} as Record<string, FieldMetadataEntity[]>,
      );

    const commonTableExpressionDefinitionsByTableName = Object.entries(
      leafFieldMetadataEntitiesByTableName,
    ).reduce<Record<string, CommonTableExpressionDefinition[]>>(
      (
        commonTableExpressionDefinitionsByTableName,
        [tableName, fieldMetadataEntities],
      ) => {
        const commonTableExpressionDefinitionsForTable =
          this.getCommonTableExpressionDefinitionsForTable(
            dataSourceSchemaName,
            tableName,
            fieldMetadataEntities,
          );

        return {
          ...commonTableExpressionDefinitionsByTableName,
          [tableName]: commonTableExpressionDefinitionsForTable,
        };
      },
      {} as Record<string, CommonTableExpressionDefinition[]>,
    );

    const commonTableExpressionDefinitions = Object.values(
      commonTableExpressionDefinitionsByTableName,
    ).flat();

    const lastResultSetNameByTableName = new Map(
      Object.entries(commonTableExpressionDefinitionsByTableName).map(
        ([tableName, commonTableExpressionDefinitions]) => {
          return [
            tableName,
            commonTableExpressionDefinitions[
              commonTableExpressionDefinitions.length - 1
            ]?.resultSetName,
          ];
        },
      ),
    );

    return {
      commonTableExpressionDefinitions,
      lastResultSetNameByTableName,
    };
  }

  private getCommonTableExpressionDefinitions(
    dataSourceSchemaName: string,
    query: DataExplorerQuery,
    fieldMetadataById: Map<string, FieldMetadataEntity>,
  ) {
    const leafFieldMetadataIds = this.getLeafFieldMetadataIds(query);

    const leafFieldMetadataEntities = leafFieldMetadataIds.map(
      (fieldMetadataId) =>
        fieldMetadataById.get(fieldMetadataId) as FieldMetadataEntity,
    );

    return this.getCommonTableExpressionDefinitionsFromLeafMetadataEntities(
      dataSourceSchemaName,
      leafFieldMetadataEntities,
    );
  }

  private async getSourceQueryRelation(
    dataSourceSchemaName: string,
    workspaceId: string,
    sourceObjectMetadata: ObjectMetadataEntity,
    query: DataExplorerQuery,
    fieldMetadataById: Map<string | undefined, FieldMetadataEntity>,
  ): Promise<JoinDefinition> {
    const baseTableName = computeObjectTargetTable(sourceObjectMetadata);

    const measureFieldMetadata = fieldMetadataById.get(
      query.measureFieldMetadataId,
    );

    const targetObjectIsSourceObject =
      measureFieldMetadata?.objectMetadataId === sourceObjectMetadata.id;

    const targetCommonTableExpressionDefinition = targetObjectIsSourceObject
      ? await this.getCommonTableExpressionDefinition(
          dataSourceSchemaName,
          baseTableName,
          measureFieldMetadata,
        )
      : undefined;

    const groupByFieldMetadata = fieldMetadataById.get(
      query.groupBys?.[0]?.fieldMetadataId,
    );

    const groupByObjectIsSourceObject =
      groupByFieldMetadata?.objectMetadataId === sourceObjectMetadata.id;

    const groupByCommonTableExpressionDefinition = groupByObjectIsSourceObject
      ? await this.getCommonTableExpressionDefinition(
          dataSourceSchemaName,
          targetCommonTableExpressionDefinition?.resultSetName ?? baseTableName,
          groupByFieldMetadata,
        )
      : undefined;

    const tableName =
      groupByCommonTableExpressionDefinition?.resultSetName ??
      targetCommonTableExpressionDefinition?.resultSetName ??
      baseTableName;

    const withQueries = [
      targetCommonTableExpressionDefinition?.withQuery,
      groupByCommonTableExpressionDefinition?.withQuery,
    ].filter((withQuery): withQuery is string => withQuery !== undefined);

    return {
      tableName,
      tableAlias: tableName,
      withQueries: withQueries,
    };
  }

  private getSelectFieldMetadataIds(
    nodes: DataExplorerQueryNode[],
    fieldMetadataIds: string[] = [],
  ): string[] {
    if (nodes.length === 0) return fieldMetadataIds;

    const newFieldMetadataIds = nodes
      .filter(
        (
          node,
        ): node is DataExplorerQueryNodeJoin | DataExplorerQueryNodeSelect =>
          node.type === 'join' || node.type === 'select',
      )
      .map((node) => node.fieldMetadataId)
      .filter(
        (fieldMetadataId): fieldMetadataId is string =>
          fieldMetadataId !== undefined,
      );

    const childNodes = nodes.flatMap((node) =>
      node.type !== 'aggregateFunction' ? (node.childNodes ?? []) : [],
    );

    return this.getSelectFieldMetadataIds(childNodes, [
      ...fieldMetadataIds,
      ...newFieldMetadataIds,
    ]);
  }

  private async getFieldMetadataById(
    workspaceId: string,
    query: DataExplorerQuery,
  ) {
    const fieldMetadataIds = [
      query.measureFieldMetadataId,
      ...(query.groupBys?.map((groupBy) => groupBy.fieldMetadataId) ?? []),
      query.orderBy?.fieldMetadataId,
      ...(query.select ? this.getSelectFieldMetadataIds([query.select]) : []),
    ].filter(
      (fieldMetadataId): fieldMetadataId is string =>
        fieldMetadataId !== undefined,
    );

    const fieldMetadataEntities =
      await this.fieldMetadataService.findByIdsWithinWorkspace(
        workspaceId,
        fieldMetadataIds,
      );

    const fieldMetadataById = new Map<string, FieldMetadataEntity>(
      fieldMetadataEntities.map((fieldMetadata) => [
        fieldMetadata.id,
        fieldMetadata,
      ]),
    );

    return fieldMetadataById;
  }

  private getNodeByFieldMetadataId(
    node?: DataExplorerQueryNode,
    targetFieldMetadataId?: string,
  ): DataExplorerQueryNodeJoin | DataExplorerQueryNodeSelect | undefined {
    if (!targetFieldMetadataId || !node) return;

    if (
      (node.type === 'join' || node.type === 'select') &&
      node.fieldMetadataId === targetFieldMetadataId
    ) {
      return node;
    }

    if (node.type !== 'aggregateFunction') {
      const foundNode = node.childNodes?.find((childNode) =>
        this.getNodeByFieldMetadataId(childNode, targetFieldMetadataId),
      );

      if (
        foundNode &&
        (foundNode.type === 'join' || foundNode.type === 'select')
      ) {
        return foundNode;
      }
    }
  }

  private getParentFieldMetadataIds(
    node?: NodeLike,
    targetFieldMetadataId?: string,
    parentFieldMetadataIds: string[] = [],
  ): string[] | undefined {
    if (!targetFieldMetadataId || !node) return;

    if (node.fieldMetadataId === targetFieldMetadataId) {
      return parentFieldMetadataIds.length > 0
        ? parentFieldMetadataIds
        : undefined;
    }

    if (node.childNodes) {
      const newPath = node.fieldMetadataId
        ? [...parentFieldMetadataIds, node.fieldMetadataId]
        : parentFieldMetadataIds;

      return node.childNodes
        .map((childNode) =>
          this.getParentFieldMetadataIds(
            childNode,
            targetFieldMetadataId,
            newPath,
          ),
        )
        .find((result) => result !== undefined);
    }

    return undefined;
  }

  private getLeafFieldMetadataIds(
    node?: NodeLike,
    leafFieldMetadataIds: string[] = [],
  ): string[] {
    if (!node || !node.fieldMetadataId) return leafFieldMetadataIds;

    const isLeaf = node.childNodes?.every(
      (childNode) => !childNode.fieldMetadataId,
    );

    if (isLeaf) {
      return [...leafFieldMetadataIds, node.fieldMetadataId];
    }

    return (
      node.childNodes?.reduce(
        (newLeafFieldMetadataIds, childNode) =>
          this.getLeafFieldMetadataIds(childNode, newLeafFieldMetadataIds),
        leafFieldMetadataIds,
      ) ?? leafFieldMetadataIds
    );
  }

  async run(
    workspaceId: string,
    query: DataExplorerQuery,
  ): Promise<DataExplorerResult> {
    const dataSourceSchemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const sourceObjectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { id: query.select?.sourceObjectMetadataId },
      });

    if (!sourceObjectMetadata) {
      throw new NotFoundException('Source object not found');
    }

    /* const measureFieldMetadata = await this.getFieldMetadata(
      workspaceId,
      query?.measureFieldMetadataId,
    );

    const groupByFieldMetadata = await this.getFieldMetadata(
      workspaceId,
      query.groupBys?.[0].fieldMetadataId,
    );

    const fieldMetadataById = await this.getFieldMetadataById(
      workspaceId,
      query,
    );

    const sourceQueryRelation = await this.getSourceQueryRelation(
      dataSourceSchemaName,
      workspaceId,
      sourceObjectMetadata,
      query,
      fieldMetadataById,
    );

    const measureFieldParentFieldMetadataIds = this.getParentFieldMetadataIds(
      query.select,
      query.measureFieldMetadataId,
    );

    const targetQueryRelations = await this.getQueryRelations(
      dataSourceSchemaName,
      workspaceId,
      sourceObjectMetadata,
      'target',
      sourceQueryRelation,
      measureFieldParentFieldMetadataIds,
      measureFieldMetadata,
    );

    const targetJoinClauses = this.getJoinClauses(
      dataSourceSchemaName,
      targetQueryRelations,
    );

    const targetQualifiedColumn = await this.getQualifiedColumn(
      workspaceId,
      targetQueryRelations,
      sourceQueryRelation.tableName,
      measureFieldParentFieldMetadataIds,
      measureFieldMetadata,
    );

    const groupByFieldParentFieldMetadataIds = this.getParentFieldMetadataIds(
      query.select,
      query.groupBys?.[0].fieldMetadataId,
    );

    const groupByQueryRelations = await this.getQueryRelations(
      dataSourceSchemaName,
      workspaceId,
      sourceObjectMetadata,
      'group_by',
      sourceQueryRelation,
      groupByFieldParentFieldMetadataIds,
      groupByFieldMetadata,
    );

    const groupByJoinClauses = this.getJoinClauses(
      dataSourceSchemaName,
      groupByQueryRelations,
    );

    // TODO: Refactor conditions
    const groupByQualifiedColumn = query.groupBys?.[0]?.fieldMetadataId
      ? await this.getQualifiedColumn(
          workspaceId,
          groupByQueryRelations,
          sourceQueryRelation.tableName,
          groupByFieldParentFieldMetadataIds,
          groupByFieldMetadata,
        )
      : undefined;

    const groupByClauseString = query.groupBys?.[0]?.fieldMetadataId
      ? `GROUP BY ${groupByQualifiedColumn}`
      : '';

    const allQueryRelations = [
      sourceQueryRelation,
      targetQueryRelations,
      groupByQueryRelations,
    ].flat();

    const commonTableExpressions = allQueryRelations
      .flatMap((queryRelation) => queryRelation.withQueries)
      .join('\n');

    console.log('commonTableExpressions', commonTableExpressions);

    if (query.measureFieldMetadataId === undefined) {
      throw new Error('Measure is currently required');
    }

    const targetNode = this.getNodeByFieldMetadataId(
      query.select,
      query.measureFieldMetadataId,
    );
    const aggregateFunction = targetNode?.childNodes?.find(
      (childNode): childNode is DataExplorerQueryNodeAggregateFunction =>
        childNode.type === 'aggregateFunction',
    )?.aggregateFunction;

    const targetSelectColumn = this.getTargetSelectColumn(
      aggregateFunction,
      targetQualifiedColumn,
    );

    const selectColumns = [targetSelectColumn, groupByQualifiedColumn].filter(
      (col) => !!col,
    );

    const joinClausesString = [targetJoinClauses, groupByJoinClauses]
      .flat()
      .filter((col) => col)
      .join('\n'); */

    // TODO:
    // 1. Resolve CTEs
    // 2. Resolve join clauses
    // 3. Resolve select clauses

    const fieldMetadataById = await this.getFieldMetadataById(
      workspaceId,
      query,
    );

    const { commonTableExpressionDefinitions, lastResultSetNameByTableName } =
      this.getCommonTableExpressionDefinitions(
        dataSourceSchemaName,
        query,
        fieldMetadataById,
      );

    /* const groupByExcludeNullsWhereClause =
      groupByQualifiedColumn && !query.groupBys?.[0]?.includeNulls
        ? `${groupByQualifiedColumn} IS NOT NULL`
        : undefined;

    const whereClauses = [groupByExcludeNullsWhereClause].filter(
      (whereClause) => whereClause !== undefined,
    );

    const whereClausesString =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sqlQuery = `
      ${commonTableExpressions}
      SELECT ${selectColumns.join(', ')}
      FROM ${sourceQueryRelation.withQueries && sourceQueryRelation.withQueries.length > 0 ? '' : `"${dataSourceSchemaName}".`}"${sourceQueryRelation.tableName}"
      ${joinClausesString}
      ${whereClausesString}
      ${groupByClauseString};
    `;

    console.log('sqlQuery\n', sqlQuery);

    const rows = await this.workspaceDataSourceService.executeRawQuery(
      sqlQuery,
      [],
      workspaceId,
    );

    console.log('rows', JSON.stringify(rows, undefined, 2));

    return { rows, sqlQuery }; */

    return { rows: [{ measure: 3 }], sqlQuery: '' };
  }
}
