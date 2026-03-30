import { View, Text, StyleSheet } from 'react-native';

import { navigationStyle } from '@/styles';

interface NavigationGroupCardProps {
  title: string;
  children: React.ReactNode;
}

const NavigationGroupCard = ({ title, children }: NavigationGroupCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderText}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: navigationStyle.secondary.container,
  cardHeader: navigationStyle.secondary.header,
  cardHeaderText: navigationStyle.secondary.headerText,
});

export default NavigationGroupCard;
