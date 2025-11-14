import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NavigationDataProvider } from '@/context/NavigationContext';
import { RootStackParamList } from './types';
import MainTabs from './MainTabs';
import ProfileScreen from '@/screens/account/ProfileScreen';
import { Color, navigationStyle } from '@/styles';

const RootStack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { t } = useTranslation();

  return (
    <NavigationDataProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen
            name="Profile" 
            component={ProfileScreen} 
            options={{
              headerShown: true,
              title: t('navigation.headerProfileTitle'),
              headerTintColor: Color.brand.primary,
              headerBackTitle: t('navigation.headerBackTitle'),
              headerBackTitleStyle: styles.headerBackTitle,
              headerTitleStyle: styles.headerTitle,
            }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </NavigationDataProvider>
  );
};

const styles = StyleSheet.create({
  headerTitle: navigationStyle.header.title,
  headerBackTitle: navigationStyle.header.backTitle,
});

export default Navigation;
