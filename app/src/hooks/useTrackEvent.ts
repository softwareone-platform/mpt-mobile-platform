import { useCallback } from 'react';

import { appInsightsService, CustomProperties } from '@/services/appInsightsService';

export function useTrackEvent() {
  return useCallback((name: string, properties?: CustomProperties) => {
    appInsightsService.trackEvent({
      name,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    });
  }, []);
}

/**
 * Non-hook version for use in services, contexts, and non-React code.
 */
export function trackEvent(name: string, properties?: CustomProperties): void {
  appInsightsService.trackEvent({
    name,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
    },
  });
}
