import { useTranslation } from 'react-i18next';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import { cardStyle, screenStyle, buttonStyle, Spacing } from '@/styles';
import NavigationItemWithIcon from '@/components/navigation-item/NavigationItemWithIcon';
import type { ProfileStackParamList } from '@/types/navigation';
import AccountSummary from '@/components/account-summary/AccountSummary';
import { useAuth } from '@/context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';

type UserDetailsScreen = Exclude<keyof ProfileStackParamList, 'profile' | 'userSettings'>;

type UserSettingsItem = {
  name: UserDetailsScreen;
  icon: string;
  isDisabled?: boolean;
};

type UserSettingsRouteProp = RouteProp<ProfileStackParamList, 'userSettings'>;

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const userDetailsData: Array<UserSettingsItem> = [
  { name: 'personalInformation', icon: 'credit-card', isDisabled: false },
  { name: 'regionalSettings', icon: 'language', isDisabled: true },
  { name: 'security', icon: 'lock', isDisabled: true },
];

const communicationData: Array<UserSettingsItem> = [
  { name: 'notificationSettings', icon: 'notifications', isDisabled: true },
  { name: 'emailSettings', icon: 'email', isDisabled: true },
];

const UserSettingsScreen = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const { params } = useRoute<UserSettingsRouteProp>();
  const { id, name, icon } = params;
  const navigation = useNavigation<ProfileScreenNavigationProp>();

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
      <View>
        <Text style={styles.sectionHeader}>{t('userSettingsScreen.userDetails')}</Text>
        <View style={styles.containerCard}>
          {userDetailsData.map((item, index) => (
            <NavigationItemWithIcon
              key={item.name}
              title={t(`userSettingsScreen.${item.name}`)}
              icon={item.icon}
              isLast={index === userDetailsData.length - 1}
              isDisabled={item.isDisabled}
              onPress={item.isDisabled ? undefined : () => navigation.navigate(item.name)}
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
              isDisabled={item.isDisabled}
              onPress={item.isDisabled ? undefined : () => navigation.navigate(item.name)}
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
