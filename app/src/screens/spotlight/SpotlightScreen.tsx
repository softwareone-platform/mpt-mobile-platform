import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useAccount } from '@/context/AccountContext';
import { Color } from '@/styles/tokens';
import { screenStyle, cardStyle, Spacing } from '@/styles';
import NavigationItemWithImage from '@/components/navigation-item/NavigationItemWithImage';
import type { SpotlightItem } from '@/types/api';
import FiltersHorizontal from '@/components/filters/FiltersHorizontal';
import EmptyState from '@/components/common/EmptyState';

const DEFAULT_FILTER = 'all';

const SpotlightScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>(DEFAULT_FILTER);
  const [filteredData, setFilteredData] = useState<Record<string, SpotlightItem[]>>({});
  const [filterKeys, setFilterKeys] = useState<string[]>([]);

  const { spotlightData, spotlightError, spotlightDataLoading } = useAccount();
  const { t } = useTranslation();

  useEffect(() => {
    if (!spotlightData || Object.keys(spotlightData).length === 0) {
      setFilteredData({});
      return;
    }

    const filterKeys = [DEFAULT_FILTER, ...Object.keys(spotlightData)];

    setFilteredData(spotlightData);
    setFilterKeys(filterKeys);
    setSelectedFilter(DEFAULT_FILTER);
  }, [spotlightData]);

  const handleFilterPress = (key: string) => {
    setSelectedFilter(key);

    if (key === DEFAULT_FILTER) {
      setFilteredData(spotlightData);
    } else {
      setFilteredData({ [key]: spotlightData[key] });
    }
  };

  if (spotlightDataLoading) {
    return (
      <View style={[styles.containerMain, styles.containerCenterContent]}>
        <ActivityIndicator size="large" color={Color.brand.primary} />
      </View>
    );
  }

  if (spotlightError) {
    return (
      <View style={styles.containerCenterContent}>
        <EmptyState
          icon={{
            name: 'block',
            variant: 'filled',
            size: 48,
            color: Color.brand.primary,
          }}
          title={t('spotlightScreen.errorFetchingDataTitle')}
          description={t('spotlightScreen.errorFetchingDataDescription')}
        />
      </View>
    );
  }

  if (!spotlightData || Object.keys(spotlightData)?.length === 0) {
    return (
        <EmptyState
          icon={{
            name: 'how-to-reg',
            variant: 'outlined',
          }}
        title={t('spotlightScreen.noTaskHeader')}
        description={t('spotlightScreen.noTaskDescription')}
      />
    );
  }

  return (
    <View style={styles.containerFillScreen}>
      <FiltersHorizontal
        filterKeys={filterKeys}
        selectedFilter={selectedFilter}
        onFilterPress={handleFilterPress}
      />
      <ScrollView style={[styles.containerMain, styles.noPaddingTop]} contentContainerStyle={styles.contentFillContainer}>
        {Object.entries(filteredData).map(([categoryName, sections]) => (
          <View key={categoryName}>
            {(sections as SpotlightItem[]).map((section) => (
              <View key={section.id} style={styles.containerCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>
                    { t(`spotlightScreen.${section?.query?.template}.title`, { count: section.total }) }
                  </Text>
                </View>
                {section.top.map((item, itemIndex) => {
                  const nestedItem = item?.product || item?.program || item?.user || item?.buyer;
                  const itemImagePath = item?.icon || nestedItem?.icon || '';
                  const itemId = item?.id || `${section.id}-${itemIndex}`;
                  const itemName = item?.name || item?.documentNo || nestedItem?.name || '';

                  return (
                    <NavigationItemWithImage
                      key={itemId}
                      id={itemId}
                      imagePath={itemImagePath}
                      title={itemName}
                      subtitle={itemId}
                      isLast={itemIndex === section.top.length - 1}
                      // TODO: Implement navigation on press of each spotlight item
                      onPress={() => {}}
                    />
                  );
                })}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>
                    {t('spotlightScreen.viewAll', {
                      showing: section.top.length,
                      total: section.total,
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Color.brand.danger,
    padding: 12,
    margin: 16,
  },
  buttonText: {
    color: Color.brand.white,
    textAlign: 'center',
  },
  containerMain: screenStyle.containerMain,
  containerCenterContent: screenStyle.containerCenterContent,
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing2,
  },
  cardHeader: cardStyle.header,
  cardHeaderText: cardStyle.headerText,
  cardFooter: cardStyle.footer,
  cardFooterText: cardStyle.footerText,
  containerFillScreen: screenStyle.containerFillScreen,
  contentFillContainer: screenStyle.contentFillContainer,
  noPaddingTop: screenStyle.noPaddingTop,
});

export default SpotlightScreen;
