import { View, ScrollView, StyleSheet } from 'react-native';

import DetailsHeader from '@/components/details/DetailsHeader';
import { screenStyle } from '@/styles';
import type { ListItemWithStatusProps } from '@/types/lists';

interface DetailsViewProps {
  header: ListItemWithStatusProps;
  children: React.ReactNode;
}

const DetailsView = ({ header, children }: DetailsViewProps) => {
  return (
    <View style={styles.containerFillScreen}>
      <DetailsHeader
        id={header.id}
        title={header.title}
        subtitle={header.subtitle}
        imagePath={header.imagePath}
        statusText={header.statusText}
      />

      <ScrollView style={styles.container}>{children}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerFillScreen: screenStyle.containerFillScreen,
  container: screenStyle.containerMain,
});

export default DetailsView;
