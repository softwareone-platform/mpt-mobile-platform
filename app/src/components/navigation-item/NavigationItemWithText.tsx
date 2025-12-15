import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import NavigationItemChevron from './NavigationItemChevron';
import { listItemStyle } from "@/styles"; 

type Props = {
  label: string;
  text: string;
  isLast?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
};

const NavigationItemWithText = ({ label, text, isLast, isDisabled, onPress }: Props) => (
  <TouchableOpacity
    style={styles.container}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.contentWrapper, isLast && styles.lastItem]}>
      <View style={styles.textContainerInline}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
          {text}
        </Text>
      </View>
      { !isDisabled && <NavigationItemChevron /> }
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: listItemStyle.container,
  lastItem: listItemStyle.lastItem,
  contentWrapper:{
    ...listItemStyle.contentWrapper,
    ...listItemStyle.textInline.contentWrapper,
  },
  textContainerInline: listItemStyle.textInline.textContainerInline,
  label: listItemStyle.textInline.labelInline,
  text: listItemStyle.textInline.textInline,

});

export default NavigationItemWithText;
