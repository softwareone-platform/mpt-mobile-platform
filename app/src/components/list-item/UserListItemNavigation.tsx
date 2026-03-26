import { TouchableOpacity } from 'react-native';

import UserListItemBase from './UserListItemBase';

import NavigationItemChevron from '@/components/navigation-item/NavigationItemChevron';
import type { ListItemWithStatusProps } from '@/types/lists';

const UserListItemNavigation = ({ onPress, ...rest }: ListItemWithStatusProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <UserListItemBase {...rest} rightElement={<NavigationItemChevron />} />
    </TouchableOpacity>
  );
};

export default UserListItemNavigation;
