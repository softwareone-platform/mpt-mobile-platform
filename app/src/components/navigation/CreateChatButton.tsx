import { TouchableOpacity, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { navigationStyle } from '@/styles';

type Props = {
  onPress?: () => void;
};

const CreateChatButton = ({ onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.topBarIconWrapper} onPress={onPress}>
      <OutlinedIcon
        name="edit-square"
        color={navigationStyle.header.rightIconColorSecondary}
        size={24}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  topBarIconWrapper: navigationStyle.header.rightIconWrapper,
});

export default CreateChatButton;
