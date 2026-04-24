import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useCallback, useRef } from 'react';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileStack from './ProfileStack';
import { RootStackParamList } from './types';

import { AnalyticsEvents } from '@/constants/analytics';
import { useAuth } from '@/context/AuthContext';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import { LoadingScreen } from '@/screens';

const RootStack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { status } = useAuth();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const routeNameRef = useRef<string | undefined>(undefined);
  const trackEvent = useTrackEvent();

  const onReady = useCallback(() => {
    routeNameRef.current = navigationRef.getCurrentRoute()?.name;
  }, [navigationRef]);

  const onStateChange = useCallback(() => {
    const currentRouteName = navigationRef.getCurrentRoute()?.name;
    if (currentRouteName && currentRouteName !== routeNameRef.current) {
      trackEvent(AnalyticsEvents.SCREEN_VIEWED, { screenName: currentRouteName });
      routeNameRef.current = currentRouteName;
    }
  }, [navigationRef, trackEvent]);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={onReady} onStateChange={onStateChange}>
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
  );
};

export default Navigation;
