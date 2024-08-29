import { FieldDataExplorerQueryValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useDataExplorerResultQuery } from '~/generated/graphql';

export const useDataExplorerResult = (recordId: string) => {
  const fieldValue = useRecoilValue<FieldDataExplorerQueryValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: 'query',
    }),
  );

  const { data, loading, refetch } = useDataExplorerResultQuery({
    variables: fieldValue
      ? {
          dataExplorerQuery: JSON.stringify(fieldValue),
        }
      : undefined,
    skip: !fieldValue,
  });

  useEffect(() => {
    refetch();
  }, [fieldValue, recordId, refetch]);

  const dataExplorerResult = data?.dataExplorerResult;
  const dataExplorerResultLoading = loading && !dataExplorerResult;

  return {
    dataExplorerResult,
    dataExplorerResultLoading,
  };
};
