import { View, Text, StyleSheet } from 'react-native';

import { listItemStyle } from '@/styles';

type Props = {
  title: string;
  subtitle: string;
  isLast?: boolean;
  onPress?: () => void;
  testID?: string;
};

const ListItemWithLabelAndText = ({ title, subtitle, isLast, testID }: Props) => (
  <View testID={testID} style={styles.container}>
    <View style={[styles.contentWrapper, isLast && styles.lastItem]}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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
