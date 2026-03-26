import { TouchableOpacity } from 'react-native';

import UserListItemBase from './UserListItemBase';

import NavigationItemChevron from '@/components/navigation-item/NavigationItemChevron';

type Props = React.ComponentProps<typeof UserListItemBase> & {
  onPress?: () => void;
};

const UserListItemNavigation = ({ onPress, ...rest }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <UserListItemBase {...rest} rightElement={<NavigationItemChevron />} />
    </TouchableOpacity>
  );
};

export default UserListItemNavigation;
