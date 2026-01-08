import { Status } from '@/types/lists';

export function getStatus(key: string, statusList: Record<string, Status>): Status {
  return statusList[key] ?? 'default';
}
