import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import { navigationStyle } from '@/styles';

type NavigationItemLabelProps = {
  title: string;
  isDisabled?: boolean;
};

const NavigationItemLabel = ({ title, isDisabled }: NavigationItemLabelProps) => (
  <View style={styles.labelContainer}>
    <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{title}</Text>

    {!isDisabled && (
      <MaterialIcons
        name="chevron-right"
        size={22}
        color={navigationStyle.secondary.chevronColor}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  label: navigationStyle.secondary.label,
  labelDisabled: navigationStyle.secondary.labelDisabled,
  labelContainer: navigationStyle.secondary.labelContainer,
});

export default NavigationItemLabel;
