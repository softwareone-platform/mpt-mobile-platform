import { useEffect } from 'react';

import { appInsightsService } from '@/services/appInsightsService';

/**
 * Hook to initialize Application Insights and track app lifecycle events
 */
export const useAppInsights = () => {
  useEffect(() => {
    // Initialize Application Insights on app start
    appInsightsService.initialize();

    // Track that the app has been fully mounted
    appInsightsService.trackEvent({
      name: 'MPT_Mobile_App_Mounted',
      properties: {
        timestamp: new Date().toISOString(),
        source: 'useAppInsights',
      },
    });

    // Track a trace message (easy to find in App Insights logs)
    appInsightsService.trackTrace(
      'MPT Mobile Platform elo2 - App component mounted successfully',
      'Information',
      { component: 'App', action: 'mount' },
    );
  }, []);

  return appInsightsService;
};
