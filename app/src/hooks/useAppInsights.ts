import { useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import { appInsightsService, AppInsightsService } from '@/services/appInsightsService';
import { logger } from '@/services/loggerService';

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

    logger.info('App mounted, telemetry event sent');
    logger.trace('App mounted, telemetry event sent trace test');
  }, []);

  useEffect(() => {
    if (user) {
      logger.trace('User context updated', {
        action: 'UserUpdated',
      });
    } else {
      logger.trace('User logged out');
    }
  }, [user]);

  return appInsightsService;
};
