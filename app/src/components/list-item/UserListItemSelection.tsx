import { TouchableOpacity } from 'react-native';

import UserListItemBase from './UserListItemBase';

import Checkbox from '@/components/select/Checkbox';
import type { ListItemWithStatusProps } from '@/types/lists';

type UserListItemSelectionProps = ListItemWithStatusProps & {
  selected: boolean;
  onToggle?: () => void;
};

const UserListItemSelection = ({ selected, onToggle, ...rest }: UserListItemSelectionProps) => {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <UserListItemBase {...rest} leftElement={<Checkbox selected={selected} />} />
    </TouchableOpacity>
  );
};

export default UserListItemSelection;
