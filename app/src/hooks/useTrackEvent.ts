import { useCallback } from 'react';

import { appInsightsService, CustomProperties } from '@/services/appInsightsService';

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

export function useTrackEvent() {
  return useCallback(trackEvent, []);
}
