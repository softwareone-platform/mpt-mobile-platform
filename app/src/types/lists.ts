export type Status = 'default' | 'info' | 'warning' | 'danger' | 'success';

export type ListItemWithStatusProps = {
  id: string;
  imagePath?: string;
  title: string;
  subtitle?: string;
  statusText: string;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  testID?: string;
};

export type ListItemConfig = {
  id: string;
  title: string;
  subtitle?: string;
  imagePath?: string;
  status: string;
};
