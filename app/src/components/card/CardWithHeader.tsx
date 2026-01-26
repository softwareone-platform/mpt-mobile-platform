import { View, Text, StyleSheet } from 'react-native';

import { cardStyle, Spacing } from '@/styles';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const CardWithHeader = ({ title, children }: CardProps) => {
  return (
    <View style={styles.containerCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderText}>{title}</Text>
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing2,
  },
  cardHeader: cardStyle.header,
  cardHeaderText: cardStyle.headerText,
});

export default CardWithHeader;
