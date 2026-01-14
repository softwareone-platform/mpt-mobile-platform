import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import PersonalInformation from '@/screens/account/PersonalInformation';
import ProfileScreen from '@/screens/account/ProfileScreen';
import UserSettingsScreen from '@/screens/account/UserSettingsScreen';
import { Color, navigationStyle } from '@/styles';
import type { ProfileStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileStack = () => {
  const { t } = useTranslation();

  const commonOptions = {
    headerShown: true,
    headerTintColor: Color.brand.primary,
    headerBackTitle: t('navigation.headerBackTitle'),
    headerBackTitleStyle: styles.headerBackTitle,
    headerTitleStyle: styles.headerTitle,
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: t('navigation.profile'),
          ...commonOptions,
        }}
      />
      <Stack.Screen
        name="userSettings"
        component={UserSettingsScreen}
        options={{
          title: t('navigation.userSettings'),
          ...commonOptions,
        }}
      />
      <Stack.Screen
        name="personalInformation"
        component={PersonalInformation}
        options={{
          title: t('navigation.personalInformation'),
          ...commonOptions,
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerTitle: navigationStyle.header.title,
  headerBackTitle: navigationStyle.header.backTitle,
});

export default ProfileStack;
