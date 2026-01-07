export type Status = 'default' | 'info' | 'warning' | 'danger' | 'success';

export type ListItemWithStatusProps = {
  id: string;
  imagePath?: string;
  title: string;
  subtitle?: string;
  status: Status;
  statusText: string;
  isLast?: boolean;
  onPress?: () => void;
  testID?: string;
};
