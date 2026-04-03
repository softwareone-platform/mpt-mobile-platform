import { View, Text, StyleSheet } from 'react-native';

import { EMPTY_VALUE } from '@/constants/common';
import { listItemStyle } from '@/styles';

type Props = {
  title: string;
  subtitle?: string | number;
  isLast?: boolean;
  testID?: string;
};

const ListItemWithLabelAndText = ({ title, subtitle, isLast, testID }: Props) => (
  <View testID={testID} style={styles.container}>
    <View style={[styles.contentWrapper, isLast && styles.lastItem]}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
          {subtitle !== undefined && subtitle !== null ? String(subtitle) : EMPTY_VALUE}
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: listItemStyle.container,
  lastItem: listItemStyle.lastItem,
  contentWrapper: {
    ...listItemStyle.contentWrapper,
    ...listItemStyle.textAndImage.contentWrapper,
  },
  textContainer: listItemStyle.textContainer,
  title: listItemStyle.title,
  subtitle: listItemStyle.textAndImage.subtitle,
});

export default ListItemWithLabelAndText;
