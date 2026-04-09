import { TouchableOpacity, StyleSheet } from 'react-native';

import { navigationStyle } from '@/styles';
import type { NavigationItemBaseProps } from '@/types/navigation';

const NavigationItemBase = ({
  children,
  isLast,
  isDisabled,
  onPress,
  testID = '',
}: React.PropsWithChildren<NavigationItemBaseProps>) => (
  <TouchableOpacity
    testID={testID}
    style={[styles.navigationItem, isLast && styles.lastItem]}
    activeOpacity={0.7}
    disabled={isDisabled}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  navigationItem: navigationStyle.secondary.navigationItem,
  lastItem: navigationStyle.secondary.lastItem,
});

export default NavigationItemBase;
