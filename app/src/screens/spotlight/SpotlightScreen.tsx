import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useAccount } from '@/context/AccountContext';
import { Color } from '@/styles/tokens';
import { screenStyle, cardStyle, Spacing } from '@/styles';
import NavigationItemWithImage from '@/components/navigation-item/NavigationItemWithImage';
import type { SpotlightItem } from '@/types/api';
import FiltersHorizontal from '@/components/filters/FiltersHorizontal';
import EmptyState from '@/components/common/EmptyState';
import { TestIDs } from '@/utils/testID';

const DEFAULT_FILTER = 'all';

const SpotlightScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>(DEFAULT_FILTER);
  const [filteredData, setFilteredData] = useState<Record<string, SpotlightItem[]>>({});
  const [filterKeys, setFilterKeys] = useState<string[]>([]);

  const { logout } = useAuth();
  const { spotlightData, spotlightError } = useAccount();
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!spotlightData) {
    return (
      <View style={[styles.containerMain, styles.containerCenterContent]}>
        <ActivityIndicator testID={TestIDs.SPOTLIGHT_LOADING_INDICATOR} size="large" color={Color.brand.primary} />
      </View>
    );
  }

  if (spotlightError) {
    return (
      <View style={styles.containerCenterContent}>
        <EmptyState
          testID={TestIDs.SPOTLIGHT_ERROR_STATE}
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

  if (Object.keys(spotlightData)?.length === 0) {
    return (
        <EmptyState
          testID={TestIDs.SPOTLIGHT_EMPTY_STATE}
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
      <TouchableOpacity testID={TestIDs.SPOTLIGHT_LOGOUT_BUTTON} style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout - dev purpose only</Text>
      </TouchableOpacity>
      <FiltersHorizontal
        filterKeys={filterKeys}
        selectedFilter={selectedFilter}
        onFilterPress={handleFilterPress}
        testIDPrefix={TestIDs.SPOTLIGHT_FILTER_PREFIX}
      />
      <ScrollView style={[styles.containerMain, styles.noPaddingTop]} contentContainerStyle={styles.contentFillContainer}>
        {Object.entries(filteredData).map(([categoryName, sections]) => (
          <View key={categoryName}>
            {(sections as SpotlightItem[]).map((section) => (
              <View key={section.id} testID={`${TestIDs.SPOTLIGHT_CARD_PREFIX}-${categoryName}-${section.id}`} style={styles.containerCard}>
                <View style={styles.cardHeader}>
                  <Text testID={`${TestIDs.SPOTLIGHT_CARD_HEADER_PREFIX}-${section.id}`} style={styles.cardHeaderText}>
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
                      testID={`${TestIDs.SPOTLIGHT_ITEM_PREFIX}-${itemId}`}
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
                  <Text testID={`${TestIDs.SPOTLIGHT_CARD_FOOTER_PREFIX}-${section.id}`} style={styles.cardFooterText}>
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
