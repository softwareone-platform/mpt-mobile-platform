import type { AvatarItem } from '@/types/chat';

export type Status = 'default' | 'info' | 'warning' | 'danger' | 'success';

export type ListItemCommonProps = {
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  testID?: string;
  headerTitleTestId?: string;
  headerStatusTestId?: string;
};

export type ListItemWithStatusProps = ListItemCommonProps & {
  id: string;
  imagePath?: string;
  title: string;
  subtitle?: string;
  statusText: string;
  variant?: 'default' | 'chat';
  avatars?: AvatarItem[];
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export type ListItemConfig = {
  id: string;
  title: string;
  subtitle?: string;
  imagePath?: string;
  status: string;
};

export type DetailsListItemValue = {
  id?: string;
  name?: string;
  icon?: string;
  type?: string;
};

export interface DetailsListItemProps {
  label: string;
  data?: DetailsListItemValue;
  hideImage?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}
