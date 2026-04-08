import { OutlinedIcons } from '@assets/icons';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import NavigationItemBase from '@/components/navigation-item/NavigationItemBase';
import NavigationItemLabel from '@/components/navigation-item/NavigationItemLabel';
import { navigationStyle } from '@/styles';
import type { NavigationItemBaseProps } from '@/types/navigation';

type NavigationItemWithIconProps = NavigationItemBaseProps & {
  title: string;
  icon: keyof typeof OutlinedIcons;
};

const NavigationItemWithIcon = ({
  title,
  icon,
  isLast,
  isDisabled,
  onPress,
  testID = '',
}: NavigationItemWithIconProps) => (
  <NavigationItemBase isLast={isLast} isDisabled={isDisabled} onPress={onPress} testID={testID}>
    <OutlinedIcon
      name={icon}
      color={
        isDisabled
          ? navigationStyle.secondary.iconColorDisabled
          : navigationStyle.secondary.iconColor
      }
      size={24}
    />
    <NavigationItemLabel title={title} isDisabled={isDisabled} />
  </NavigationItemBase>
);

export default NavigationItemWithIcon;
