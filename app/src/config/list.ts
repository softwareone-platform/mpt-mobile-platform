import type { ListItemConfig } from '@/types/lists';

export const listItemConfigFull: ListItemConfig = {
  id: 'id',
  title: 'name',
  subtitle: 'id',
  imagePath: 'icon',
  status: 'status',
};

export const listItemConfigNoImage: ListItemConfig = {
  id: 'id',
  title: 'name',
  subtitle: 'id',
  status: 'status',
};

export const listItemConfigNoImageNoSubtitle: ListItemConfig = {
  id: 'id',
  title: 'id',
  status: 'status',
};
