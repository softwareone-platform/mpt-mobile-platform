import { Status, ListItemWithStatusProps, ListItemConfig } from '@/types/lists';

export function getStatus(key: string, statusList: Record<string, Status>): Status {
  return statusList[key] ?? 'default';
}

function getField(item: Record<string, unknown>, key: string): string | undefined {
  const value = item[key];
  return value !== null && value !== undefined ? String(value) : undefined;
}

export function mapToListItemProps(
  item: Record<string, unknown>,
  config: ListItemConfig,
): ListItemWithStatusProps {
  return {
    id: String(item[config.id]),
    title: String(item[config.title]),
    subtitle: config.subtitle ? getField(item, config.subtitle) : undefined,
    imagePath: config.imagePath ? getField(item, config.imagePath) : undefined,
    statusText: getField(item, config.status),
  };
}
