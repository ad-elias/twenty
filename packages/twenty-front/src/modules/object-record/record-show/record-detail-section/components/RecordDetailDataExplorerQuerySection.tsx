import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useDataExplorerQueryField } from '@/object-record/record-field/meta-types/hooks/useDataExplorerQueryField';
import { DataExplorerQuery } from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { RecordDetailSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailSection';
import { RecordDetailSectionHeader } from '@/object-record/record-show/record-detail-section/components/RecordDetailSectionHeader';
import { SelectedFieldDropdown } from '@/object-record/record-show/record-detail-section/components/data-explorer/SelectedFieldDropdown';
import { SourceNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/SourceNode';
import styled from '@emotion/styled';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

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
      <RecordDetailSectionHeader title="Select" />
      <StyledSection>
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
      </StyledSection>
      <RecordDetailSectionHeader title="Measure" />
      <StyledSection>
        <SelectedFieldDropdown
          dataExplorerQuery={fieldValue ?? {}}
          fieldMetadataId={fieldValue?.measureFieldMetadataId}
          hotkeyScope={hotkeyScope}
          onChange={(newFieldMetadataId) => {
            const newDataExplorerQuery: DataExplorerQuery = {
              ...fieldValue,
              measureFieldMetadataId: newFieldMetadataId,
            };
            setFieldValue(newDataExplorerQuery);
          }}
          dropdownId="data-explorer-query-measure-dropdown"
        />
      </StyledSection>
      <RecordDetailSectionHeader title="Group by" />
      <StyledSection>
        <SelectedFieldDropdown
          dataExplorerQuery={fieldValue ?? {}}
          fieldMetadataId={fieldValue?.groupBy?.[0]?.groupByFieldMetadataId}
          hotkeyScope={hotkeyScope}
          onChange={(newFieldMetadataId) => {
            const newDataExplorerQuery: DataExplorerQuery = {
              ...fieldValue,
              groupBy: [
                {
                  groupByFieldMetadataId: newFieldMetadataId,
                },
              ],
            };
            setFieldValue(newDataExplorerQuery);
          }}
          dropdownId="data-explorer-query-group-by-dropdown"
        />
      </StyledSection>
      <RecordDetailSectionHeader title="Order by" />
      <StyledSection>
        <SelectedFieldDropdown
          dataExplorerQuery={fieldValue ?? {}}
          fieldMetadataId={fieldValue?.orderBy?.orderByFieldMetadataId}
          hotkeyScope={hotkeyScope}
          onChange={(newFieldMetadataId) => {
            const newDataExplorerQuery: DataExplorerQuery = {
              ...fieldValue,
              orderBy: {
                orderByFieldMetadataId: newFieldMetadataId,
              },
            };
            setFieldValue(newDataExplorerQuery);
          }}
          dropdownId="data-explorer-query-order-by-dropdown"
        />
        <button
          style={{ marginTop: 12 }}
          onClick={() => persistField(fieldValue)}
        >
          Save
        </button>
      </StyledSection>
    </RecordDetailSection>
  );
};
