import { TouchableOpacity } from 'react-native';

import UserListItemBase from './UserListItemBase';

import Checkbox from '@/components/select/Checkbox';

type Props = React.ComponentProps<typeof UserListItemBase> & {
  selected: boolean;
  onToggle?: () => void;
};

const UserListItemSelection = ({ selected, onToggle, ...rest }: Props) => {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <UserListItemBase
        {...rest}
        leftElement={<Checkbox selected={selected} onPress={onToggle} />}
      />
    </TouchableOpacity>
  );
};

// const styles = StyleSheet.create({
//   selectionWrapper: {
//     // marginLeft: 12,
//   },
// });

export default UserListItemSelection;
