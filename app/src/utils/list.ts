import { Status, ListItemWithStatusProps, ListItemConfig } from '@/types/lists';

export function getStatus(key: string, statusList: Record<string, Status>): Status {
  return statusList[key] ?? 'default';
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
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
    id: String(getNestedValue(item, config.id) ?? ''),
    title: String(getNestedValue(item, config.title) ?? ''),
    subtitle: config.subtitle ? String(getNestedValue(item, config.subtitle) ?? '') : undefined,
    imagePath: config.imagePath ? String(getNestedValue(item, config.imagePath) ?? '') : undefined,
    statusText: String(getNestedValue(item, config.status) ?? ''),
  };
}
