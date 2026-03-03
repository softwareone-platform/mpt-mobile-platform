import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import Avatar from './Avatar';

import {
  DEFAULT_CHAT_AVTAR_SIZE,
  MAX_NUMBER_OF_CHAT_AVATARS,
  DEFAULT_AVATAR_IMAGE_SHIFT,
} from '@/constants';
import { groupAvatarStyle } from '@/styles';

interface GroupAvatarItem {
  id: string;
  imagePath?: string;
}

interface GroupAvatarProps {
  avatars: GroupAvatarItem[];
  size?: number;
}

const GroupAvatar: React.FC<GroupAvatarProps> = ({ avatars, size = DEFAULT_CHAT_AVTAR_SIZE }) => {
  const displayedAvatars = avatars.slice(0, MAX_NUMBER_OF_CHAT_AVATARS);
  const avatarCount = displayedAvatars.length;

  if (avatarCount === 0) {
    return null;
  }

  const half = Math.floor(size / 2);
  const shift = Math.floor(size / 4);

  const renderGroupAvatar = (
    user: GroupAvatarItem,
    avatarSize: number,
    regionStyle: StyleProp<ViewStyle>,
    shiftX = DEFAULT_AVATAR_IMAGE_SHIFT,
  ) => (
    <View style={regionStyle}>
      <View style={styles.avatarInner}>
        <View style={{ transform: [{ translateX: shiftX }] }}>
          <Avatar {...user} size={avatarSize} />
        </View>
      </View>
    </View>
  );

  const containerStyle = {
    ...styles.container,
    width: size,
    height: size,
  };

  return (
    <View style={containerStyle}>
      {avatarCount === 1 && renderGroupAvatar(displayedAvatars[0], size, styles.regionFull)}
      {avatarCount === 2 && (
        <>
          {renderGroupAvatar(displayedAvatars[0], size, styles.regionLeft, shift)}
          {renderGroupAvatar(displayedAvatars[1], size, styles.regionRight, -shift)}
        </>
      )}
      {avatarCount === 3 && (
        <>
          {renderGroupAvatar(displayedAvatars[0], size, styles.regionLeft, shift)}
          {renderGroupAvatar(displayedAvatars[1], half, styles.regionTopRight)}
          {renderGroupAvatar(displayedAvatars[2], half, styles.regionBottomRight)}
        </>
      )}
      {avatarCount === 4 && (
        <>
          {renderGroupAvatar(displayedAvatars[0], half, styles.regionTopLeft)}
          {renderGroupAvatar(displayedAvatars[1], half, styles.regionTopRight)}
          {renderGroupAvatar(displayedAvatars[2], half, styles.regionBottomLeft)}
          {renderGroupAvatar(displayedAvatars[3], half, styles.regionBottomRight)}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: groupAvatarStyle.container,
  avatarInner: groupAvatarStyle.avatarInner,
  regionFull: groupAvatarStyle.regionFull,
  regionLeft: groupAvatarStyle.regionLeft,
  regionRight: groupAvatarStyle.regionRight,
  regionTopRight: groupAvatarStyle.regionTopRight,
  regionBottomRight: groupAvatarStyle.regionBottomRight,
  regionTopLeft: groupAvatarStyle.regionTopLeft,
  regionBottomLeft: groupAvatarStyle.regionBottomLeft,
});

export default GroupAvatar;
