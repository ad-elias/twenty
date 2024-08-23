import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { useIcons } from 'twenty-ui';

interface ObjectSelectItemProps {
  objectMetadata: ObjectMetadataItem;
  onSelect: (objectMetadataId: string) => void;
}

export const ObjectSelectItem = (props: ObjectSelectItemProps) => {
  /*   const { isSelectedItemIdSelector } = useSelectableList(
    FIELD_PATH_PICKER_SELECTABLE_LIST_ID,
  );
  const isSelectedByKeyboard = useRecoilValue(
    isSelectedItemIdSelector(props.objectMetadata.id),
  ); */

  const { getIcon } = useIcons();
  const IconComponent = getIcon(props.objectMetadata.icon);

  return (
    <StyledMenuItemBase
      onClick={() => props.onSelect(props.objectMetadata.id)}
      isKeySelected={false}
    >
      <MenuItemLeftContent
        LeftIcon={IconComponent}
        text={props.objectMetadata.labelPlural}
      />
    </StyledMenuItemBase>
  );
};
