import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { checkboxStyle } from '@/styles';

type CheckboxProps = {
  selected: boolean;
  onPress?: () => void;
};

const Checkbox = ({ selected }: CheckboxProps) => {
  return (
    <View style={[styles.container, selected && styles.containerSelected]}>
      {selected && <MaterialIcons name="check" size={16} color={checkboxStyle.iconColor} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: checkboxStyle.container,
  containerSelected: checkboxStyle.containerSelected,
});

export default Checkbox;
