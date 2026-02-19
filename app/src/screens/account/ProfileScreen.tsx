import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import EmptyState from '@/components/common/EmptyState';
import ListItemWithImage from '@/components/list-item/ListItemWithImage';
import NavigationItemWithImage from '@/components/navigation-item/NavigationItemWithImage';
import Tabs, { TabData } from '@/components/tabs/Tabs';
import { useAccount } from '@/context/AccountContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { cardStyle, screenStyle, Spacing, spacingStyle } from '@/styles';
import { FormattedUserAccounts } from '@/types/api';
import type { ProfileStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

export const DEFAULT_ACCOUNT_FILTER = 'all';

const ProfileScreen = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedTab, setSelectedTab] =
    useState<keyof FormattedUserAccounts>(DEFAULT_ACCOUNT_FILTER);

  const { userData, userAccountsData, switchAccount } = useAccount();
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

  const accountsToDisplay = userAccountsData[selectedTab] || [];
  const filterKeys = ['all', 'favourites', 'recent'] as (keyof FormattedUserAccounts)[];

  const tabData: TabData[] = filterKeys.map((key) => ({
    label: t(`profileScreen.tabs.${key}`),
    value: key,
  }));

  useEffect(() => {
    if (userData?.currentAccount?.id) {
      setSelectedAccountId(userData.currentAccount.id);
    }
  }, [userData]);

  const handleSwitchAccount = async (accountId: string) => {
    if (accountId === selectedAccountId) return;

    setIsSwitching(true);
    setSelectedAccountId(accountId);
    try {
      await switchAccount(accountId);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <ScrollView style={styles.containerMain}>
      <View>
        <Text testID={TestIDs.PROFILE_SECTION_YOUR_PROFILE} style={styles.sectionHeader}>
          {t('profileScreen.yourProfile')}
        </Text>
        <View style={styles.containerCard}>
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
        </View>
      </View>
      <View>
        <Text testID={TestIDs.PROFILE_SECTION_SWITCH_ACCOUNT} style={styles.sectionHeader}>
          {t('profileScreen.switchAccount')}
        </Text>
        {isEnabled('FEATURE_ACCOUNT_TABS') && (
          <Tabs
            tabs={tabData}
            value={selectedTab}
            onChange={(tabValue) => setSelectedTab(tabValue as keyof FormattedUserAccounts)}
            testID={TestIDs.PROFILE_ACCOUNT_TABS}
            tabTestIDPrefix={TestIDs.PROFILE_TAB_PREFIX}
          />
        )}
        <View style={styles.containerCard}>
          {accountsToDisplay.length === 0 ? (
            <View style={[styles.containerCenterContent, styles.paddingVertical4]}>
              <EmptyState
                icon={{
                  name: 'how-to-reg',
                  variant: 'outlined',
                }}
                title={t(`profileScreen.accountsEmptyState.${selectedTab}.title`)}
                description={t(`profileScreen.accountsEmptyState.${selectedTab}.description`)}
              />
            </View>
          ) : (
            accountsToDisplay.map((account, index) => (
              <ListItemWithImage
                key={account.id}
                testID={`${TestIDs.PROFILE_ACCOUNT_ITEM_PREFIX}-${account.id}`}
                id={account.id}
                imagePath={account.icon}
                title={account.name}
                subtitle={account.id}
                isLast={index === accountsToDisplay.length - 1}
                isSelected={account.id === selectedAccountId}
                isUpdatingSelection={isSwitching && account.id === selectedAccountId}
                onPress={() => handleSwitchAccount(account.id)}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing2,
  },
  containerCenterContent: screenStyle.containerCenterContent,
  sectionHeader: screenStyle.sectionHeader,
  paddingVertical4: spacingStyle.paddingVertical4,
});

export default ProfileScreen;
