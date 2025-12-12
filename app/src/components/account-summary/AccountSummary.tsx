import { View, Text, StyleSheet } from "react-native";
import { accountSummaryStyle } from "@/styles"; 
import AvatarIcon from "@/components/avatar/Avatar";

type Props = {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
};

const AccountSummary = ({ id, title, subtitle, icon}: Props) => (
  <View style={styles.container}>
    <View style={styles.avatarWrapper}>
      <AvatarIcon id={id} imagePath={icon} size={80} variant="large" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: accountSummaryStyle.container,
  avatarWrapper: accountSummaryStyle.avatarWrapper,
  textContainer: accountSummaryStyle.textContainer,
  title: accountSummaryStyle.title,
  subtitle: accountSummaryStyle.subtitle,
});

export default AccountSummary;
