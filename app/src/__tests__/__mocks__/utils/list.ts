import type { Status } from '@/types/lists';

export const statusList = {
  Accepted: 'success',
  'Invitation Expired': 'default',
  Configuring: 'info',
  Conflict: 'danger',
  'For Sale': 'success',
  Review: 'warning',
} as const satisfies Record<string, Status>;
