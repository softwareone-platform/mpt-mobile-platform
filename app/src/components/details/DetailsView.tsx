import { View, ScrollView, StyleSheet } from 'react-native';

import DetailsHeader from '@/components/details/DetailsHeader';
import { screenStyle } from '@/styles';
import type { ListItemConfig, ListItemWithStatusProps } from '@/types/lists';
import { mapToListItemProps } from '@/utils/list';

interface DetailsViewProps<T extends object> {
  data: T;
  config: ListItemConfig;
  children: React.ReactNode;
}

const DetailsView = <T extends object>({ data, config, children }: DetailsViewProps<T>) => {
  const header: ListItemWithStatusProps = mapToListItemProps(
    data as Record<string, unknown>,
    config,
  );

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
