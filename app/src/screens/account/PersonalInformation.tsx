import { useTranslation } from 'react-i18next';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { cardStyle, screenStyle, Spacing } from '@/styles';
import AccountSummary from '@/components/account-summary/AccountSummary';
import { useAccount } from '@/context/AccountContext';
import EmptyState from '@/components/common/EmptyState';
import { Color } from '@/styles/tokens';
import { TestIDs } from '@/utils/testID';
import { formatPhoneNumber } from '@/utils/formatting';
import NavigationItemWithText from '@/components/navigation-item/NavigationItemWithText';

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
  const { userData, userDataLoading, userDataError } = useAccount();

  if (userDataLoading) {
    return (
      <View style={[styles.containerMain, styles.containerCenterContent]}>
        <ActivityIndicator testID={TestIDs.PERSONAL_INFO_LOADING_INDICATOR} size="large" color={Color.brand.primary} />
      </View>
    );
  }

  if (userDataError) {
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
    return (
        <EmptyState
          testID={TestIDs.PERSONAL_INFO_EMPTY_STATE}
      />
    );
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
              item.name === 'phone'
                ? formatPhoneNumber(userData.phone?.prefix, userData.phone?.number)
                : userData[item.name] ?? '';

            return <NavigationItemWithText
              key={item.name}
              label={t(`personalInformationScreen.${item.name}`)}
              text={value}
              isLast={index === personalInformationData.length - 1}
              isDisabled={item.isDisabled}
            />
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
