import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import AvatarIcon from '@/components/avatar/Avatar';
import { Color, listItemStyle } from '@/styles';

type Props = {
  id: string;
  imagePath?: string;
  title: string;
  subtitle: string;
  isLast?: boolean;
  isSelected?: boolean;
  isUpdatingSelection?: boolean;
  onPress?: () => void;
  testID?: string;
};

const ListItemWithImage = ({
  id,
  imagePath,
  title,
  subtitle,
  isLast,
  isSelected,
  isUpdatingSelection,
  onPress,
  testID,
}: Props) => (
  <TouchableOpacity testID={testID} style={styles.container} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.avatarWrapper}>
      <AvatarIcon id={id} imagePath={imagePath} size={44} />
    </View>
    <View style={[styles.contentWrapper, isLast && styles.lastItem]}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {isUpdatingSelection ? (
        <ActivityIndicator size="small" color={Color.brand.primary} />
      ) : (
        isSelected && <MaterialIcons name="check" size={22} color={Color.brand.primary} />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: listItemStyle.container,
  lastItem: listItemStyle.lastItem,
  avatarWrapper: listItemStyle.textAndImage.avatarWrapper,
  contentWrapper: {
    ...listItemStyle.contentWrapper,
    ...listItemStyle.textAndImage.contentWrapper,
  },
  textContainer: listItemStyle.textContainer,
  title: listItemStyle.title,
  subtitle: listItemStyle.textAndImage.subtitle,
});

export default ListItemWithImage;
