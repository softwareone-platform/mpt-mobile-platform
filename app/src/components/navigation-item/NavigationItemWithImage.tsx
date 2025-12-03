import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { listItemStyle } from "@/styles"; 
import AvatarIcon from "@/components/avatar/Avatar";
import NavigationItemChevron from './NavigationItemChevron';

type Props = {
  id: string;
  imagePath?: string;
  title: string;
  subtitle: string;
  isLast?: boolean;
  onPress?: () => void;
};

const NavigationItemWithImage = ({ id, imagePath, title, subtitle, isLast, onPress }: Props) => (
  <TouchableOpacity
    style={styles.container}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.avatarWrapper}>
      <AvatarIcon id={id} imagePath={imagePath} size={44} />
    </View>
    <View style={[styles.contentWrapper, isLast && styles.lastItem]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <NavigationItemChevron />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: listItemStyle.container,
  lastItem: listItemStyle.lastItem,
  avatarWrapper: listItemStyle.textAndImage.avatarWrapper,
  contentWrapper:{
    ...listItemStyle.contentWrapper,
    ...listItemStyle.textAndImage.contentWrapper,
  },
  textContainer: listItemStyle.textContainer,
  title: listItemStyle.title,
  subtitle: listItemStyle.textAndImage.subtitle,
});

export default NavigationItemWithImage;
