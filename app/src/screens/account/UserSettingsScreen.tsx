import { useTranslation } from 'react-i18next';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute} from '@react-navigation/native';
import { cardStyle, screenStyle, buttonStyle, Spacing } from '@/styles';
import NavigationItemWithIcon from '@/components/navigation-item/NavigationItemWithIcon';
import type { ProfileStackParamList } from '@/types/navigation';
import AccountSummary from '@/components/account-summary/AccountSummary';
import { useAuth } from '@/context/AuthContext';

type UserSettingsItem = {
  name: keyof ProfileStackParamList;
  icon: string;
};

type UserSettingsRouteProp = RouteProp<ProfileStackParamList, 'userSettings'>;

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
  const { logout } = useAuth();
  const { t } = useTranslation();
  const { params } = useRoute<UserSettingsRouteProp>();
  const { id, name, icon } = params;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.containerMain}>
      <AccountSummary
        id={id}
        title={name}
        subtitle={id}
        icon={icon}
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
      <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogout}>
        <Text style={styles.buttonPrimaryText}>{t('common.action.signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing4,
  },
  sectionHeader: screenStyle.sectionHeader,
  buttonPrimary: {
    ...buttonStyle.common,
    ...buttonStyle.primaryLight,
    ...buttonStyle.fullWidth,
  },
  buttonPrimaryText: buttonStyle.primaryLightText,
});

export default UserSettingsScreen;
