import ListItemWithImage from '@/components/list-item/ListItemWithImage';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { DetailsListItemProps } from '@/types/lists';

const DetailsListItem = ({ label, data, hideImage, isLast, onPress }: DetailsListItemProps) => {
  const disabled = !onPress;
  if (!data) {
    return (
      <ListItemWithLabelAndText
        title={label}
        subtitle={undefined}
        isLast={isLast}
        onPress={onPress}
      />
    );
  }

  return (
    <ListItemWithImage
      id={data.id || ''}
      title={label}
      subtitle={data.name || ''}
      subtitleLink={true}
      hideImage={hideImage}
      imagePath={data.icon}
      onPress={onPress}
      disabled={disabled}
      isLast={isLast}
    />
  );
};

export default DetailsListItem;
