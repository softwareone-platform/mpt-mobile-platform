import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { NavigationDataProvider } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { RootStackParamList } from './types';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import ProfileStack from './ProfileStack';
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
