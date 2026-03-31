import { OutlinedIcons } from '@assets/icons';
import { AnimatedIcons } from '@assets/icons/custom';
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type OutlinedIconName = keyof typeof OutlinedIcons;

export type AnimatedIconName = keyof typeof AnimatedIcons;

export type IconVariant = 'filled' | 'outlined';

export interface BaseIconProps {
  size?: number;
  color?: string;
}

export interface DynamicIconProps extends BaseIconProps {
  name: OutlinedIconName | MaterialIconName | AnimatedIconName;
  variant?: IconVariant;
}

export interface OutlinedIconProps extends BaseIconProps {
  name: OutlinedIconName;
}

export type AvatarVariant = 'default' | 'small' | 'medium' | 'large' | 'badgeSmall' | 'badgeMedium';

export interface AvatarProps {
  id: string;
  imagePath?: string;
  size?: number;
  variant?: AvatarVariant;
}

export type AvatarWithBadgeVariant = 'small' | 'medium';

export type AvatarWithBadgeProps = {
  userAvatarProps: AvatarProps;
  accountLogoProps: AvatarProps;
  variant: AvatarWithBadgeVariant;
};
