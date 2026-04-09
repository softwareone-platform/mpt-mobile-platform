import NavigationItemBase from '@/components/navigation-item/NavigationItemBase';
import NavigationItemLabel from '@/components/navigation-item/NavigationItemLabel';
import type { NavigationItemBaseProps } from '@/types/navigation';

type NavigationItemProps = NavigationItemBaseProps & {
  title: string;
};

const NavigationItem = ({
  title,
  isLast,
  isDisabled,
  onPress,
  testID = '',
}: NavigationItemProps) => (
  <NavigationItemBase isLast={isLast} isDisabled={isDisabled} onPress={onPress} testID={testID}>
    <NavigationItemLabel title={title} isDisabled={isDisabled} />
  </NavigationItemBase>
);

export default NavigationItem;
