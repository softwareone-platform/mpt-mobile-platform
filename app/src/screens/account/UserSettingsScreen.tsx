import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { cardStyle, screenStyle, Spacing } from '@/styles';
import NavigationItemWithIcon from '@/components/navigation-item/NavigationItemWithIcon';
import type { ProfileStackParamList } from '@/types/navigation';
import AccountSummary from '@/components/account-summary/AccountSummary';

type UserSettingsItem = {
  name: keyof ProfileStackParamList;
  icon: string;
};

const userDetailsData: Array<UserSettingsItem> = [
  { name: 'personalInformation', icon: 'credit-card' },
  { name: 'regionalSettings', icon: 'language' },
  { name: 'security', icon: 'lock' },
];

const communicationData: Array<UserSettingsItem> = [
  { name: 'notificationSettings', icon: 'notifications' },
  { name: 'emailSettings', icon: 'email' },
];

const UserSettingsScreen = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.containerMain}>
      <AccountSummary
        id="123"
        title="Sarah Sanderson"
        subtitle="USR-1234-1234"
      />
      <View >
        <Text style={styles.sectionHeader}>{t('userSettingsScreen.userDetails')}</Text>
        <View style={styles.containerCard}>
          {userDetailsData.map((item, index) => (
            <NavigationItemWithIcon
              key={item.name}
              title={t(`userSettingsScreen.${item.name}`)}
              icon={item.icon}
              isLast={index === userDetailsData.length - 1}
            />
          ))}
        </View>
      </View>
      <View>
        <Text style={styles.sectionHeader}>{t('userSettingsScreen.communication')}</Text>
        <View style={styles.containerCard}>
          {communicationData.map((item, index) => (
            <NavigationItemWithIcon
              key={item.name}
              title={t(`userSettingsScreen.${item.name}`)}
              icon={item.icon}
              isLast={index === communicationData.length - 1}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing4,
  },
  sectionHeader: screenStyle.sectionHeader,
});

export default UserSettingsScreen;
