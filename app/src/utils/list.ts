import { Status, ListItemWithStatusProps, ListItemConfig } from '@/types/lists';

export function getStatus(key: string, statusList: Record<string, Status>): Status {
  return statusList[key] ?? 'default';
}

export function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }

    return undefined;
  }, obj);
}

export function mapToListItemProps(
  item: Record<string, unknown>,
  config: ListItemConfig,
): ListItemWithStatusProps {
  return {
    id: String(item[config.id]),
    title: String(item[config.title]),
    subtitle: config.subtitle ? String(getValueByPath(item, config.subtitle)) : undefined,
    imagePath: config.imagePath ? String(item[config.imagePath]) : undefined,
    statusText: String(item[config.status]),
  };
}
