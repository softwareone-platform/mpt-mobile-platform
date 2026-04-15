import { View, Text, StyleSheet } from 'react-native';

import { cardStyle } from '@/styles';

interface CardHeaderProps {
  title: string;
  testID?: string;
}

const CardHeader = ({ title }: CardHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: cardStyle.headerContainer,
  header: cardStyle.header,
  headerText: cardStyle.headerText,
});

export default CardHeader;
