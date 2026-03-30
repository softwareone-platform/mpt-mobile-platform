import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import Avatar from './Avatar';

import { avatarWithBadgeStyle, avatarSize, badgeSize } from '@/styles/components/avatar';
import type { AvatarWithBadgeProps, AvatarWithBadgeVariant, AvatarVariant } from '@/types/icons';

const AvatarWithBadge = ({ userAvatarProps, accountLogoProps, variant }: AvatarWithBadgeProps) => {
  const mapVariant: Record<AvatarWithBadgeVariant, AvatarVariant> = {
    small: 'badgeSmall',
    medium: 'badgeMedium',
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        /* eslint-disable react-native/no-unused-styles */
        container: avatarWithBadgeStyle[variant].container,
        badge: avatarWithBadgeStyle[variant].badge,
      }),
    [variant],
  );

  return (
    <View style={styles.container}>
      <Avatar
        id={userAvatarProps.id}
        imagePath={userAvatarProps.imagePath}
        variant={variant}
        size={avatarSize[variant]}
      />
      <View style={styles.badge}>
        <Avatar
          id={accountLogoProps.id}
          imagePath={accountLogoProps.imagePath}
          variant={mapVariant[variant]}
          size={badgeSize[variant]}
        />
      </View>
    </View>
  );
};

export default AvatarWithBadge;
