import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';

import DetailsHeader from '@/components/details/DetailsHeader';
import { screenStyle, Color } from '@/styles';
import type { ListItemConfig, ListItemWithStatusProps } from '@/types/lists';
import { mapToListItemProps } from '@/utils/list';

interface DetailsViewProps<T extends object> {
  data: T;
  config: ListItemConfig;
  children: React.ReactNode;
  headerTitleTestId?: string;
  headerStatusTestId?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const DetailsView = <T extends object>({
  data,
  config,
  children,
  headerTitleTestId,
  headerStatusTestId,
  onRefresh,
  isRefreshing,
}: DetailsViewProps<T>) => {
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
        headerTitleTestId={headerTitleTestId}
        headerStatusTestId={headerStatusTestId}
      />

      <ScrollView
        style={styles.container}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing ?? false}
              onRefresh={onRefresh}
              tintColor={Color.brand.primary}
              colors={[Color.brand.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerFillScreen: screenStyle.containerFillScreen,
  container: screenStyle.containerMain,
});

export default DetailsView;
