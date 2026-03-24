import { OutlinedIcons } from '@assets/icons';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { Color, navigationStyle } from '@/styles';

type NavigationItemWithIconProps = {
  title: string;
  icon: string;
  isLast?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
  testID?: string;
};

const NavigationItemWithIcon = ({
  title,
  icon,
  isLast,
  isDisabled,
  onPress,
  testID = '',
}: NavigationItemWithIconProps) => (
  <TouchableOpacity
    testID={testID}
    style={[styles.navigationItem, isLast && styles.lastItem]}
    activeOpacity={0.7}
    disabled={isDisabled}
    onPress={onPress}
  >
    <OutlinedIcon
      name={icon as keyof typeof OutlinedIcons}
      color={isDisabled ? Color.gray.gray3 : Color.brand.primary}
      size={24}
    />

    <View style={styles.labelContainer}>
      <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{title}</Text>

      {!isDisabled && <MaterialIcons name="chevron-right" size={22} color={Color.gray.gray4} />}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  navigationItem: navigationStyle.secondary.navigationItem,
  label: navigationStyle.secondary.label,
  labelDisabled: navigationStyle.secondary.labelDisabled,
  labelContainer: navigationStyle.secondary.labelContainer,
  lastItem: navigationStyle.secondary.lastItem,
});

export default NavigationItemWithIcon;
