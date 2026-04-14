import { View, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { HELPDESK_AVATAR_SIZE, HELPDESK_ICON_SIZE } from '@/constants/icons';
import { iconStyle } from '@/styles';

interface HelpdeskAvatarProps {
  size?: number;
}

const HelpdeskAvatar = ({ size = HELPDESK_AVATAR_SIZE }: HelpdeskAvatarProps) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <OutlinedIcon name="headset-mic" size={HELPDESK_ICON_SIZE} color={iconStyle.iconColorPrimary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...iconStyle.backgroundContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HelpdeskAvatar;
