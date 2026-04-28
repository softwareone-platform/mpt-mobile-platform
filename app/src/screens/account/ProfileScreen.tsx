import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

import CardHeader from '@/components/card/CardHeader';
import CardWithHeader from '@/components/card/CardWithHeader';
import EmptyState from '@/components/common/EmptyState';
import RefreshControl from '@/components/common/RefreshControl';
import ListItemWithImage from '@/components/list-item/ListItemWithImage';
import NavigationItemWithImage from '@/components/navigation-item/NavigationItemWithImage';
import Tabs, { TabData } from '@/components/tabs/Tabs';
import { FLATLIST_END_REACHED_THRESHOLD } from '@/constants/api';
import { useAccount } from '@/context/AccountContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { cardStyle, listItemStyle, screenStyle, Spacing, spacingStyle } from '@/styles';
import { FormattedUserAccounts, UserAccount } from '@/types/api';
import type { ProfileStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

export const DEFAULT_ACCOUNT_FILTER = 'all';

const FILTER_KEYS: (keyof FormattedUserAccounts)[] = ['all', 'favourites', 'recent'];

const ProfileScreen = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedTab, setSelectedTab] =
    useState<keyof FormattedUserAccounts>(DEFAULT_ACCOUNT_FILTER);

  const {
    userData,
    userAccountsData,
    switchAccount,
    accountsFetchingNext,
    hasMoreAccounts,
    fetchNextAccounts,
    refetchAccounts,
    isAccountsRefetching,
  } = useAccount();
  const { isEnabled } = useFeatureFlags();

  const lastUserDataRef = useRef(userData);

  useEffect(() => {
    if (userData) {
      lastUserDataRef.current = userData;
    }
  }, [userData]);

  const displayUserData = userData ?? lastUserDataRef.current;
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { t } = useTranslation();

  const accountsToDisplay = useMemo(
    () => userAccountsData[selectedTab] || [],
    [userAccountsData, selectedTab],
  );

  const tabData: TabData[] = useMemo(
    () =>
      FILTER_KEYS.map((key) => ({
        label: t(`profileScreen.tabs.${key}`),
        value: key,
      })),
    [t],
  );

  useEffect(() => {
    if (userData?.currentAccount?.id) {
      setSelectedAccountId(userData.currentAccount.id);
    }
  }, [userData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isSwitching) return;
      e.preventDefault();
    });

    navigation.setOptions({
      gestureEnabled: !isSwitching,
      headerLeft: (props) => (
        <HeaderBackButton
          {...props}
          onPress={isSwitching ? undefined : props.onPress}
          disabled={isSwitching}
        />
      ),
    });
    return () => {
      unsubscribe();
    };
  }, [navigation, isSwitching]);

  const handleSwitchAccount = useCallback(
    async (accountId: string) => {
      if (accountId === selectedAccountId) return;

      setIsSwitching(true);
      setSelectedAccountId(accountId);
      try {
        await switchAccount(accountId);
      } finally {
        setIsSwitching(false);
      }
    },
    [selectedAccountId, switchAccount],
  );

  const listHeader = useMemo(
    () => (
      <View>
        <CardWithHeader
          title={t('profileScreen.userProfile')}
          testID={TestIDs.PROFILE_SECTION_YOUR_PROFILE}
        >
          {displayUserData && (
            <NavigationItemWithImage
              testID={TestIDs.PROFILE_USER_ITEM}
              id={displayUserData.id}
              imagePath={displayUserData.icon}
              title={displayUserData.name}
              subtitle={displayUserData.id}
              isLast={true}
              onPress={() =>
                navigation.navigate('userSettings', {
                  id: displayUserData.id,
                  name: displayUserData.name,
                  icon: displayUserData.icon,
                })
              }
            />
          )}
        </CardWithHeader>
        {isEnabled('FEATURE_ACCOUNT_TABS') && (
          <Tabs
            tabs={tabData}
            value={selectedTab}
            onChange={(tabValue) => setSelectedTab(tabValue as keyof FormattedUserAccounts)}
            testID={TestIDs.PROFILE_ACCOUNT_TABS}
            tabTestIDPrefix={TestIDs.PROFILE_TAB_PREFIX}
          />
        )}
        <CardHeader title={t('profileScreen.switchAccount')} />
      </View>
    ),
    [displayUserData, isEnabled, navigation, selectedTab, t, tabData],
  );

  const listEmpty = useMemo(
    () => (
      <View style={styles.containerCard}>
        <EmptyState
          icon={{
            name: 'how-to-reg',
            variant: 'outlined',
          }}
          title={t(`profileScreen.accountsEmptyState.${selectedTab}.title`)}
          description={t(`profileScreen.accountsEmptyState.${selectedTab}.description`)}
        />
      </View>
    ),
    [selectedTab, t],
  );

  const listFooter =
    selectedTab === 'all' && accountsFetchingNext ? (
      <ActivityIndicator style={styles.footerSpinner} />
    ) : null;

  const renderItem = useCallback(
    ({ item, index }: { item: UserAccount; index: number }) => {
      const isLast = index === accountsToDisplay.length - 1;
      return (
        <View style={[styles.accountItem, isLast && styles.accountItemLast]}>
          <ListItemWithImage
            testID={`${TestIDs.PROFILE_ACCOUNT_ITEM_PREFIX}-${item.id}`}
            id={item.id}
            imagePath={item.icon}
            title={item.name}
            subtitle={item.id}
            isLast={isLast}
            isSelected={item.id === selectedAccountId}
            isUpdatingSelection={isSwitching && item.id === selectedAccountId}
            onPress={() => handleSwitchAccount(item.id)}
          />
        </View>
      );
    },
    [accountsToDisplay, selectedAccountId, isSwitching, handleSwitchAccount],
  );

  const handleEndReached = useCallback(() => {
    if (selectedTab === 'all' && hasMoreAccounts && !accountsFetchingNext) {
      fetchNextAccounts();
    }
  }, [selectedTab, hasMoreAccounts, accountsFetchingNext, fetchNextAccounts]);

  return (
    <FlatList
      style={styles.containerMain}
      data={accountsToDisplay}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={listFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={FLATLIST_END_REACHED_THRESHOLD}
      refreshControl={
        <RefreshControl refreshing={isAccountsRefetching} onRefresh={refetchAccounts} />
      }
    />
  );
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  containerCard: {
    ...cardStyle.containerRoundedBottom,
    ...screenStyle.containerCenterContent,
    ...spacingStyle.paddingVertical4,
  },
  accountItem: {
    ...listItemStyle.listItemDynamic.container,
    ...listItemStyle.listItemDynamic.contentWrapper,
  },
  accountItemLast: {
    ...listItemStyle.listItemDynamic.lastItem,
    marginBottom: Spacing.spacing2,
  },
  footerSpinner: {
    marginVertical: Spacing.spacing4,
  },
});

export default ProfileScreen;
