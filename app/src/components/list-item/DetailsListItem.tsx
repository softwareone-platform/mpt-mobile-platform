import ListItemWithImage from '@/components/list-item/ListItemWithImage';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { DetailsListItemProps } from '@/types/lists';

const DetailsListItem = ({
  label,
  data,
  items,
  hideImage,
  isLast,
  onPress,
  subtitle,
}: DetailsListItemProps) => {
  const disabled = !onPress;

  const count = items?.length ?? 0;

  const item = items ? items[0] : data;

  // Multiple items
  if (items && count > 1) {
    return (
      <ListItemWithLabelAndText
        title={label}
        subtitle={`${count} ${label.toLowerCase()}`}
        isLast={isLast}
      />
    );
  }

  // Empty state
  if (!item) {
    return <ListItemWithLabelAndText title={label} subtitle={undefined} isLast={isLast} />;
  }

  // Single item
  return (
    <ListItemWithImage
      id={item.id || ''}
      title={label}
      subtitle={subtitle || item.name || ''}
      subtitleLink
      hideImage={hideImage}
      imagePath={item.icon}
      onPress={onPress}
      disabled={disabled}
      isLast={isLast}
    />
  );
};

export default DetailsListItem;
