import { TouchableOpacity, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { navigationStyle } from '@/styles';

const ChatMoreButton = () => {
  return (
    <TouchableOpacity style={styles.topBarIconWrapper} onPress={() => {}}>
      <OutlinedIcon
        name="more-horiz"
        color={navigationStyle.header.rightIconColorPrimary}
        size={24}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  topBarIconWrapper: navigationStyle.header.rightIconWrapper,
});

export default ChatMoreButton;
