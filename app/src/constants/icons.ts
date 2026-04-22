import { MIN_TOUCH_TARGET } from './common';

import { Color, Spacing } from '@/styles';

export const DEFAULT_ICON_SIZE = 24;
export const DEFAULT_ICON_COLOR = Color.gray.gray4;
export const DEFAULT_ICON_VARIANT = 'filled';
export const DEFAULT_AVATAR_SIZE = 32;
export const DEFAULT_AVATAR_VARIANT = 'default';
export const DEFAULT_CHAT_AVATAR_SIZE = 48;
export const MIN_NUMBER_OF_CHAT_AVATARS = 1;
export const MAX_NUMBER_OF_CHAT_AVATARS = 3;
export const DEFAULT_AVATAR_IMAGE_SHIFT = 0;
export const HELPDESK_AVATAR_SIZE = 44;
export const HELPDESK_AVATAR_ICON_PADDING = Spacing.spacingSmall10;

const ICON_ONLY_BUTTON_PADDING = 12;
export const ICON_ONLY_BUTTON_SIZE = DEFAULT_ICON_SIZE + ICON_ONLY_BUTTON_PADDING;

const buttonIconOnlySlop = (MIN_TOUCH_TARGET - ICON_ONLY_BUTTON_SIZE) / 2;
export const BUTTON_ICON_ONLY_HIT_SLOP = {
  top: buttonIconOnlySlop,
  bottom: buttonIconOnlySlop,
  left: buttonIconOnlySlop,
  right: buttonIconOnlySlop,
};

const iconSlop = (MIN_TOUCH_TARGET - DEFAULT_ICON_SIZE) / 2;
export const ICON_HIT_SLOP = {
  top: iconSlop,
  bottom: iconSlop,
  left: iconSlop,
  right: iconSlop,
};
