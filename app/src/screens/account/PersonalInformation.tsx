import { useTranslation } from 'react-i18next';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';

import AccountSummary from '@/components/account-summary/AccountSummary';
import EmptyState from '@/components/common/EmptyState';
import NavigationItemWithText from '@/components/navigation-item/NavigationItemWithText';
import { EMPTY_VALUE } from '@/constants/common';
import { useAccount } from '@/context/AccountContext';
import { cardStyle, screenStyle, Spacing } from '@/styles';
import { Color } from '@/styles/tokens';
import { formatPhoneNumber } from '@/utils/formatting';
import { TestIDs } from '@/utils/testID';

type PersonalInfoKey = 'firstName' | 'lastName' | 'email' | 'phone';

type PersonalInformationItem = {
  name: PersonalInfoKey;
  isDisabled?: boolean;
};

const personalInformationData: Array<PersonalInformationItem> = [
  { name: 'firstName', isDisabled: true },
  { name: 'lastName', isDisabled: true },
  { name: 'email', isDisabled: true },
  { name: 'phone', isDisabled: true },
];

const PersonalInformation = () => {
  const { t } = useTranslation();
  const { userData, isUserDataLoading, isUserDataError } = useAccount();

  const phoneNumber =
    formatPhoneNumber(userData?.phone?.prefix, userData?.phone?.number) || EMPTY_VALUE;

  if (isUserDataLoading) {
    return (
      <View style={[styles.containerMain, styles.containerCenterContent]}>
        <ActivityIndicator
          testID={TestIDs.PERSONAL_INFO_LOADING_INDICATOR}
          size="large"
          color={Color.brand.primary}
        />
      </View>
    );
  }

  if (isUserDataError) {
    return (
      <View style={styles.containerCenterContent}>
        <EmptyState
          testID={TestIDs.PERSONAL_INFO_ERROR_STATE}
          icon={{
            name: 'block',
            variant: 'filled',
            size: 48,
            color: Color.brand.primary,
          }}
        />
      </View>
    );
  }

  if (!userData) {
    return <EmptyState testID={TestIDs.PERSONAL_INFO_EMPTY_STATE} />;
  }

  return (
    <ScrollView style={styles.containerMain}>
      <AccountSummary
        id={userData?.id}
        title={userData?.name}
        subtitle={userData?.id}
        icon={userData?.icon}
      />
      <View>
        <Text style={styles.sectionHeader}>{t('userSettingsScreen.userDetails')}</Text>
        <View style={styles.containerCard}>
          {personalInformationData.map((item, index) => {
            const value =
              item.name === 'phone' ? phoneNumber : (userData[item.name] ?? EMPTY_VALUE);
            return (
              <NavigationItemWithText
                key={item.name}
                label={t(`personalInformationScreen.${item.name}`)}
                text={value}
                isLast={index === personalInformationData.length - 1}
                isDisabled={item.isDisabled}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  containerCenterContent: screenStyle.containerCenterContent,
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing4,
  },
  sectionHeader: screenStyle.sectionHeader,
});

export default PersonalInformation;
