import type { Status, ListItemWithStatusProps } from '@/types/lists';

export const statusList = {
  Accepted: 'success',
  'Invitation Expired': 'default',
  Configuring: 'info',
  Conflict: 'danger',
  'For Sale': 'success',
  Review: 'warning',
} as const satisfies Record<string, Status>;

export const baseItem = {
  id: '123',
  name: 'Test Item',
  status: 'Active',
  icon: '/path/to/image.png',
};

export const itemWithNumericField = {
  id: 123,
  name: 'Test Item',
  status: 'Active',
  icon: '/path/to/image.png',
};

export const expectedMappedItemFull: ListItemWithStatusProps = {
  id: '123',
  title: 'Test Item',
  subtitle: '123',
  imagePath: '/path/to/image.png',
  statusText: 'Active',
};

export const expectedMappedItemNoImage: ListItemWithStatusProps = {
  id: '123',
  title: 'Test Item',
  subtitle: '123',
  imagePath: undefined,
  statusText: 'Active',
};

export const expectedMappedItemNoImageNoSubtitle: ListItemWithStatusProps = {
  id: '123',
  title: '123',
  subtitle: undefined,
  imagePath: undefined,
  statusText: 'Active',
};
