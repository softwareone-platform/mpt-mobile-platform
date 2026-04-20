import { View, StyleSheet } from 'react-native';

import CardHeader from '@/components/card/CardHeader';
import { cardStyle, Spacing } from '@/styles';

interface CardProps {
  title: string;
  children: React.ReactNode;
  testID?: string;
}

const CardWithHeader = ({ title, children, testID }: CardProps) => {
  return (
    <View style={styles.containerCard}>
      <CardHeader title={title} testID={testID} />

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
