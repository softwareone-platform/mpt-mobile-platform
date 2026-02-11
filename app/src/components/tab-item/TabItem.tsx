import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { tabItemStyle } from '@/styles/components/tab';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

const TabItem = ({ label, selected, onPress, testID }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.itemSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: tabItemStyle.container,
  itemSelected: tabItemStyle.itemSelected,
  label: tabItemStyle.label,
  labelSelected: tabItemStyle.labelSelected,
});

export default TabItem;
