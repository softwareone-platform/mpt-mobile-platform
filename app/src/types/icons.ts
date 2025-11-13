import type { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { OutlinedIcons } from '@assets/icons';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type OutlinedIconName = keyof typeof OutlinedIcons;

export type IconVariant = 'filled' | 'outlined';

export interface BaseIconProps {
  size?: number;
  color?: string;
}

export interface DynamicIconProps extends BaseIconProps {
  name: string;
  variant?: IconVariant;
}

export interface OutlinedIconProps extends BaseIconProps {
  name: OutlinedIconName;
}
