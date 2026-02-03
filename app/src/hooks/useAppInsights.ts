import { useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import { appInsightsService, AppInsightsService } from '@/services/appInsightsService';

export const useAppInsights = (): AppInsightsService => {
  const { user } = useAuth();

  useEffect(() => {
    appInsightsService.setUserProvider(() => user);
  }, [user]);

  useEffect(() => {
    appInsightsService.initialize();

    appInsightsService.trackEvent({
      name: 'MPT_Mobile_App_Mounted',
      properties: {
        timestamp: new Date().toISOString(),
        source: 'useAppInsights',
      },
    });

    console.info('[AppInsights] App mounted, telemetry event sent.');
  }, []);

  useEffect(() => {
    if (user) {
      const accountId = user['https://claims.softwareone.com/accountId'] as string | undefined;
      console.info('[AppInsights] User context updated:', { accountId });
      appInsightsService.trackTrace('User context updated', 'Information', {
        component: 'App',
        action: 'UserUpdated',
      });
    } else {
      console.info('[AppInsights] User logged out');
    }
  }, [user]);

  return appInsightsService;
};
