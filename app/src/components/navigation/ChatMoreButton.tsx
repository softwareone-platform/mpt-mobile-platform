import { TouchableOpacity, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { MIN_TOUCH_TARGET, DEFAULT_ICON_SIZE } from '@/constants';
import { navigationStyle } from '@/styles';

const iconHitSlop = (MIN_TOUCH_TARGET - DEFAULT_ICON_SIZE) / 2;
const hitSlop = { top: iconHitSlop, bottom: iconHitSlop, left: iconHitSlop, right: iconHitSlop };

const ChatMoreButton = () => {
  return (
    <TouchableOpacity style={styles.topBarIconWrapper} onPress={() => {}} hitSlop={hitSlop}>
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
