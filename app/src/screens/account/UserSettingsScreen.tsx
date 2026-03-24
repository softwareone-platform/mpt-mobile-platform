import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';

import AccountSummary from '@/components/account-summary/AccountSummary';
import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import NavigationItemWithIcon from '@/components/navigation-item/NavigationItemWithIcon';
import { useAuth } from '@/context/AuthContext';
import { screenStyle, buttonStyle } from '@/styles';
import type { ProfileStackParamList } from '@/types/navigation';

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
      <AccountSummary id={id} title={name} subtitle={id} icon={icon} />
      <NavigationGroupCard title={t('userSettingsScreen.userDetails')}>
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
      </NavigationGroupCard>
      <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogout}>
        <Text style={styles.buttonPrimaryText}>{t('common.action.signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  buttonPrimary: {
    ...buttonStyle.primaryLight,
    ...buttonStyle.fullWidth,
  },
  buttonPrimaryText: buttonStyle.primaryLightText,
});

export default UserSettingsScreen;
