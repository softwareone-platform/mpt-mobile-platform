import { AnimatedIcons } from '@assets/icons/custom';
import { View } from 'react-native';

import { DEFAULT_ICON_SIZE } from '@/constants/icons';

type AnimatedIconProps = {
  name: string;
  size?: number;
};

const AnimatedIcon = ({ name, size = DEFAULT_ICON_SIZE }: AnimatedIconProps) => {
  const IconShape = AnimatedIcons[name];

  if (!IconShape) {
    console.warn(`Animated icon "${name}" not found`);
    return null;
  }

  return (
    <View style={{ width: size, height: size }}>
      <IconShape size={size} />
    </View>
  );
};

export default AnimatedIcon;
