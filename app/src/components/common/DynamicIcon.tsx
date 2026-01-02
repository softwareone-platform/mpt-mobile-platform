import { MaterialIcons } from '@expo/vector-icons';

import OutlinedIcon from './OutlinedIcon';

import { DEFAULT_ICON_SIZE, DEFAULT_ICON_COLOR, DEFAULT_ICON_VARIANT } from '@/constants/icons';
import { MaterialIconName, DynamicIconProps, OutlinedIconName } from '@/types/icons';

const DynamicIcon = ({
  name,
  variant = DEFAULT_ICON_VARIANT,
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
}: DynamicIconProps) => {
  if (variant === 'filled') {
    // Filled MaterialIcons from Expo
    return <MaterialIcons name={name as MaterialIconName} size={size} color={color} />;
  }

  if (!OutlinedIcon) {
    // fallback to filled if outlined is missing
    return <MaterialIcons name={name as MaterialIconName} size={size} color={color} />;
  }

  return <OutlinedIcon name={name as OutlinedIconName} size={size} color={color} />;
};

export default DynamicIcon;
