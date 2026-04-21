import { TouchableOpacity, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { MIN_TOUCH_TARGET, DEFAULT_ICON_SIZE } from '@/constants';
import { navigationStyle } from '@/styles';
import { TestIDs } from '@/utils/testID';

type CreateChatButtonProps = {
  onPress?: () => void;
};

const iconHitSlop = (MIN_TOUCH_TARGET - DEFAULT_ICON_SIZE) / 2;
const hitSlop = { top: iconHitSlop, bottom: iconHitSlop, left: iconHitSlop, right: iconHitSlop };

const CreateChatButton = ({ onPress }: CreateChatButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.topBarIconWrapper}
      onPress={onPress}
      testID={TestIDs.CREATE_CHAT_BUTTON}
      hitSlop={hitSlop}
    >
      <OutlinedIcon
        name="edit-square"
        color={navigationStyle.header.rightIconColorSecondary}
        size={24}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  topBarIconWrapper: navigationStyle.header.leftIconWrapper,
});

export default CreateChatButton;
