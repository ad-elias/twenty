import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldTextMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const supportedFieldMetadataTypes = new Set([
  FieldMetadataType.Currency,
  FieldMetadataType.Number,
  FieldMetadataType.Relation,
]);

const isNotSystemRelation = (
  field: Pick<
    FieldMetadataItem,
    'type' | 'toRelationMetadata' | 'fromRelationMetadata'
  >,
) =>
  field.type !== FieldMetadataType.Relation ||
  !field.toRelationMetadata?.fromObjectMetadata.isSystem ||
  !field.fromRelationMetadata?.toObjectMetadata.isSystem;

export const isFieldMetadataSelectable = (
  field: Pick<
    FieldMetadataItem,
    | 'isActive'
    | 'isSystem'
    | 'type'
    | 'toRelationMetadata'
    | 'fromRelationMetadata'
  >,
): field is FieldDefinition<FieldTextMetadata> =>
  !!field.isActive &&
  !field.isSystem &&
  supportedFieldMetadataTypes.has(field.type) &&
  isNotSystemRelation(field);
