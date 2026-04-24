import type { CustomProperties } from '@/services/appInsightsService';

export type TrackEventFn = (name: string, properties?: CustomProperties) => void;
