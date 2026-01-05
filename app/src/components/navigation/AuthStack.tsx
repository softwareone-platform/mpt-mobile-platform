import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { WelcomeScreen, OTPVerificationScreen } from '@/screens/auth';
import { Color, navigationStyle } from '@/styles';
import { AuthStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerTintColor: Color.brand.primary,
          headerBackTitle: t('navigation.headerBackTitle'),
          headerBackTitleStyle: styles.headerBackTitle,
          headerShadowVisible: false,
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerBackTitle: navigationStyle.header.backTitle,
});

export default AuthStack;
