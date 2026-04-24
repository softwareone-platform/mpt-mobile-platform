import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { avatarWithIconStyle } from '@/styles';
import type { AvatarWithIconProps } from '@/types/icons';

const HelpdeskAvatar = ({ variant = 'default' }: AvatarWithIconProps) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        /* eslint-disable react-native/no-unused-styles */
        container: avatarWithIconStyle[variant].container,
      }),
    [variant],
  );

  return (
    <View style={styles.container}>
      <OutlinedIcon
        name="headset-mic"
        size={avatarWithIconStyle.iconSize}
        color={avatarWithIconStyle.iconColor}
      />
    </View>
  );
};

export default HelpdeskAvatar;
