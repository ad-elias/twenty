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

  const testValue: DataExplorerQuery = {
    sourceObjectMetadataId: '20202020-b374-4779-a561-80086cb2e17f',
    childNodes: [
      {
        type: 'join',
        fieldMetadataId: '20202020-3213-4ddf-9494-6422bcff8d7c',
        childNodes: [],
      },
    ],
  };

  return (
    <RecordDetailSection>
      <RecordDetailSectionHeader title="Data explorer query" />
      fieldValue: {JSON.stringify(fieldValue)}
      <button
        onClick={async () => {
          setFieldValue(testValue);
        }}
      >
        Set test fieldValue
      </button>
      <button
        onClick={() => {
          persistField(fieldValue);
        }}
      >
        Persist
      </button>
      <SourceNode
        dataExplorerQuery={fieldValue ?? {}}
        hotkeyScope={hotkeyScope}
        onChange={(newDataExplorerQuery) => {
          setFieldValue(newDataExplorerQuery);
        }}
      />
    </RecordDetailSection>
  );
};
