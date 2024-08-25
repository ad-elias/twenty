import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useDataExplorerQueryField } from '@/object-record/record-field/meta-types/hooks/useDataExplorerQueryField';
import { DataExplorerQuery } from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { RecordDetailSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailSection';
import { RecordDetailSectionHeader } from '@/object-record/record-show/record-detail-section/components/RecordDetailSectionHeader';
import { SourceNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/SourceNode';

type RecordDetailDataExplorerQuerySectionProps = {
  loading: boolean;
};

export const RecordDetailDataExplorerQuerySection = ({
  loading,
}: RecordDetailDataExplorerQuerySectionProps) => {
  const { recordId } = useContext(FieldContext);

  const {
    draftValue,
    setDraftValue,
    fieldDefinition,
    fieldValue,
    setFieldValue,
    hotkeyScope,
    sourceObjectNameSingular,
  } = useDataExplorerQueryField();

  const persistField = usePersistField();

  return (
    <RecordDetailSection>
      <RecordDetailSectionHeader title="Data explorer query" />
      fieldValue: {JSON.stringify(fieldValue)}
      <button
        onClick={async () => {
          setFieldValue({});
        }}
      >
        Clear fieldValue
      </button>
      <button
        style={{ marginBottom: 12 }}
        onClick={() => {
          persistField(fieldValue);
        }}
      >
        Persist
      </button>
      <SourceNode
        node={fieldValue?.select}
        hotkeyScope={hotkeyScope}
        onChange={(newNode) => {
          const newDataExplorerQuery: DataExplorerQuery = {
            ...fieldValue,
            select: newNode,
          };
          setFieldValue(newDataExplorerQuery);
        }}
      />
    </RecordDetailSection>
  );
};
