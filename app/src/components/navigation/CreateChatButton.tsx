import { TouchableOpacity, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { navigationStyle } from '@/styles';
import { TestIDs } from '@/utils/testID';

type CreateChatButtonProps = {
  onPress?: () => void;
};

const CreateChatButton = ({ onPress }: CreateChatButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.topBarIconWrapper}
      onPress={onPress}
      testID={TestIDs.CREATE_CHAT_BUTTON}
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
  topBarIconWrapper: navigationStyle.header.rightIconWrapper,
});

export default CreateChatButton;
