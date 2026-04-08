import { TouchableOpacity } from 'react-native';

import UserListItemBase from './UserListItemBase';

import NavigationItemChevron from '@/components/navigation-item/NavigationItemChevron';
import type { ListItemWithStatusProps } from '@/types/lists';

const UserListItemNavigation = ({ onPress, disabled, ...rest }: ListItemWithStatusProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={disabled}>
      <UserListItemBase {...rest} rightElement={<NavigationItemChevron />} />
    </TouchableOpacity>
  );
};

export default UserListItemNavigation;
