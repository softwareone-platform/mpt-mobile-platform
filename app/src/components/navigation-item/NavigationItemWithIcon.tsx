import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import NavigationItemChevron from './NavigationItemChevron';
import { Color, listItemStyle } from "@/styles"; 
import { OutlinedIcons } from '@assets/icons';
import OutlinedIcon from '@/components/common/OutlinedIcon';

type Props = {
  title: string;
  icon: string;
  isLast?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
};

const NavigationItemWithIcon = ({ title, icon, isLast, isDisabled, onPress }: Props) => (
  <TouchableOpacity
    style={styles.container}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.iconWrapper}>
      <OutlinedIcon 
        name={icon as keyof typeof OutlinedIcons}
        color={isDisabled ? Color.gray.gray3 : Color.brand.primary}
        size={24}
      />
    </View>
    <View style={[styles.contentWrapper, isLast && styles.lastItem]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      {!isDisabled && <NavigationItemChevron />}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: listItemStyle.container,
  lastItem: listItemStyle.lastItem,
  iconWrapper: listItemStyle.textAndIcon.iconWrapper,
  contentWrapper:{
    ...listItemStyle.contentWrapper,
    ...listItemStyle.textAndIcon.contentWrapper,
  },
  textContainer: listItemStyle.textContainer,
  title: listItemStyle.title,
});

export default NavigationItemWithIcon;
