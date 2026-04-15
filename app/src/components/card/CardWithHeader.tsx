import { View, StyleSheet } from 'react-native';

import CardHeader from '@/components/card/CardHeader';
import { cardStyle, Spacing } from '@/styles';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const CardWithHeader = ({ title, children }: CardProps) => {
  return (
    <View style={styles.containerCard}>
      <CardHeader title={title} />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing2,
  },
});

export default CardWithHeader;
