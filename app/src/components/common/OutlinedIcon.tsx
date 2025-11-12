// components/common/icons/OutlinedIcon.tsx
import React from 'react';
import { Svg } from 'react-native-svg';
import { OutlinedIcons } from '@assets/icons';
import type { OutlinedIconProps } from '@/types/icons';
import { DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR } from '@/constants/icons';

const OutlinedIcon = ({
  name,
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: OutlinedIconProps) => {
  const IconShape = OutlinedIcons[name];

  if (!IconShape) {
    console.warn(`Outlined icon "${name}" not found`);
    return null;
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill={color}>
      <IconShape color={color} />
    </Svg>
  );
};

export default OutlinedIcon;
