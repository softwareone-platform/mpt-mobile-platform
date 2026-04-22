import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

import NavigationItemChevron from './NavigationItemChevron';

import { listItemStyle } from '@/styles';

type Props = {
  label: string;
  text: string;
  isLast?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
};

const NavigationItemWithText = ({ label, text, isLast, isDisabled, onPress }: Props) => {
  const inner = (
    <View style={[styles.contentWrapper, isLast && styles.lastItem]}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
          {text}
        </Text>
      </View>
      {!isDisabled && <NavigationItemChevron />}
    </View>
  );

  if (isDisabled) {
    return <View style={styles.container}>{inner}</View>;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {inner}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: listItemStyle.container,
  lastItem: listItemStyle.lastItem,
  contentWrapper: {
    ...listItemStyle.contentWrapper,
    ...listItemStyle.textOnly.contentWrapper,
  },
  label: listItemStyle.textOnly.label,
  text: listItemStyle.textOnly.text,
});

export default NavigationItemWithText;
