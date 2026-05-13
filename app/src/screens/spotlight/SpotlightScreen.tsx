import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import CardHeader from '@/components/card/CardHeader';
import EmptyState from '@/components/common/EmptyState';
import RefreshControl from '@/components/common/RefreshControl';
import RefreshableEmptyWrapper from '@/components/common/RefreshableEmptyWrapper';
import FiltersHorizontal from '@/components/filters/FiltersHorizontal';
import NavigationItemWithImage from '@/components/navigation-item/NavigationItemWithImage';
import { AnalyticsEvents } from '@/constants/analytics';
import { useAccount } from '@/context/AccountContext';
import { trackEvent } from '@/hooks/useTrackEvent';
import { screenStyle, cardStyle, Spacing } from '@/styles';
import { Color } from '@/styles/tokens';
import type { SpotlightItemWithDetails } from '@/types/api';
import type { RootStackParamList } from '@/types/navigation';
import type { SpotlightCategoryName } from '@/types/spotlight';
import { formatSpotlightQuery } from '@/utils/spotlight';
import { TestIDs } from '@/utils/testID';

const DEFAULT_FILTER = 'all';

const SpotlightScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>(DEFAULT_FILTER);
  const [filteredData, setFilteredData] = useState<
    Partial<Record<SpotlightCategoryName, SpotlightItemWithDetails[]>>
  >({});
  const [filterKeys, setFilterKeys] = useState<string[]>([]);

  const {
    spotlightData,
    isSpotlightError,
    isSpotlightDataLoading,
    isSwitchingAccount,
    refetchSpotlight,
    isSpotlightRefetching,
  } = useAccount();
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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

  if (isSpotlightDataLoading || isSwitchingAccount) {
    return (
      <View style={[styles.containerMain, styles.containerCenterContent]}>
        <ActivityIndicator
          testID={TestIDs.SPOTLIGHT_LOADING_INDICATOR}
          size="large"
          color={Color.brand.primary}
        />
      </View>
    );
  }

  if (isSpotlightError) {
    return (
      <RefreshableEmptyWrapper onRefresh={refetchSpotlight} isRefreshing={isSpotlightRefetching}>
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
      </RefreshableEmptyWrapper>
    );
  }

  if (!spotlightData || Object.keys(spotlightData)?.length === 0) {
    return (
      <RefreshableEmptyWrapper onRefresh={refetchSpotlight} isRefreshing={isSpotlightRefetching}>
        <EmptyState
          testID={TestIDs.SPOTLIGHT_EMPTY_STATE}
          icon={{
            name: 'how-to-reg',
            variant: 'outlined',
          }}
          title={t('spotlightScreen.noTaskHeader')}
          description={t('spotlightScreen.noTaskDescription')}
        />
      </RefreshableEmptyWrapper>
    );
  }

  const handleNavigate = (section: SpotlightItemWithDetails) => {
    const filter = formatSpotlightQuery(section.query?.filter || '');

    navigation.navigate(section.listScreenName, { query: filter });
  };

  return (
    <View style={styles.containerFillScreen}>
      <FiltersHorizontal
        filterKeys={filterKeys}
        selectedFilter={selectedFilter}
        onFilterPress={handleFilterPress}
        translationPrefix="spotlightScreen.group"
        testIDPrefix={TestIDs.SPOTLIGHT_FILTER_PREFIX}
      />
      <ScrollView
        style={[styles.containerMain, styles.noPaddingTop]}
        contentContainerStyle={styles.contentFillContainer}
        refreshControl={
          <RefreshControl refreshing={isSpotlightRefetching} onRefresh={refetchSpotlight} />
        }
      >
        {Object.entries(filteredData).map(([categoryName, sections]) => (
          <View key={categoryName}>
            {(sections as SpotlightItemWithDetails[]).map((section) => (
              <View
                key={section.id}
                testID={`${TestIDs.SPOTLIGHT_CARD_PREFIX}-${categoryName}-${section.id}`}
                style={styles.containerCard}
              >
                <CardHeader
                  title={t(`spotlightScreen.${section?.query?.template}.title`, {
                    count: section.total,
                  })}
                  testID={`${TestIDs.SPOTLIGHT_CARD_HEADER_PREFIX}-${section.id}`}
                />
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
                      onPress={() => {
                        trackEvent(AnalyticsEvents.SPOTLIGHT_ITEM_SELECTED, {
                          itemType: section.detailsScreenName,
                          itemId,
                        });
                        navigation.navigate(section.detailsScreenName, {
                          id: itemId,
                        });
                      }}
                    />
                  );
                })}
                <TouchableOpacity
                  style={styles.cardFooter}
                  onPress={() => {
                    handleNavigate(section);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    testID={`${TestIDs.SPOTLIGHT_CARD_FOOTER_PREFIX}-${section.id}`}
                    style={styles.cardFooterText}
                  >
                    {t('spotlightScreen.viewAll', {
                      showing: section.top.length,
                      total: section.total,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  containerCenterContent: screenStyle.containerCenterContent,
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing2,
  },
  cardFooter: cardStyle.footer,
  cardFooterText: cardStyle.footerText,
  containerFillScreen: screenStyle.containerFillScreen,
  contentFillContainer: screenStyle.contentFillContainer,
  noPaddingTop: screenStyle.noPaddingTop,
});

export default SpotlightScreen;
