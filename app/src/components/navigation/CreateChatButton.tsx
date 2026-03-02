import { TouchableOpacity, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { navigationStyle } from '@/styles';

const CreateChatButton = () => {
  return (
    <TouchableOpacity style={styles.topBarIconWrapper} onPress={() => {}}>
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
