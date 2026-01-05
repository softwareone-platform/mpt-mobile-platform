import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileStack from './ProfileStack';
import { RootStackParamList } from './types';

import { useAuth } from '@/context/AuthContext';
import { NavigationDataProvider } from '@/context/NavigationContext';
import { LoadingScreen } from '@/screens';

const RootStack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <NavigationDataProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {status === 'authenticated' ? (
            <>
              <RootStack.Screen name="Main" component={MainTabs} />
              <RootStack.Screen name="ProfileRoot" component={ProfileStack} />
            </>
          ) : (
            <RootStack.Screen name="Auth" component={AuthStack} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </NavigationDataProvider>
  );
};

export default Navigation;
