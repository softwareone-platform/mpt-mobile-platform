import { ReactNativePlugin } from '@microsoft/applicationinsights-react-native';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { configService } from '@/config/env.config';
import { User } from '@/services/authService';

export type SeverityLevel = 'Verbose' | 'Information' | 'Warning' | 'Error' | 'Critical';

export interface CustomProperties {
  [key: string]: string | number | boolean | undefined;
}

export interface AppInsightsEvent {
  name: string;
  properties?: CustomProperties;
}

const APPLICATION_NAME = 'MarketplaceMobile';

class AppInsightsService {
  private appInsights: ApplicationInsights | null = null;
  private getUserFn: (() => User | null) | null = null;
  private isInitialized = false;

  public initialize(): void {
    if (this.isInitialized) {
      console.warn('[AppInsights] Already initialized');
      return;
    }

    const connectionString = configService.get('APPLICATION_INSIGHTS_CONNECTION_STRING');

    if (!connectionString) {
      console.warn('[AppInsights] Connection string not found. Telemetry will be disabled.');
      return;
    }

    try {
      const RNPlugin = new ReactNativePlugin();
      this.appInsights = new ApplicationInsights({
        config: {
          connectionString,
          extensions: [RNPlugin],
          enableAutoRouteTracking: true,
        },
      });

      this.appInsights.loadAppInsights();

      /* istanbul ignore next - telemetry initializer executes at SDK runtime and cannot be tested with Jest mocks */
      this.appInsights.addTelemetryInitializer((item) => {
        if (item.baseData) {
          item.baseData.properties = item.baseData.properties || {};
          item.baseData.properties.Application = APPLICATION_NAME;
          item.baseData.properties.AppVersion = DeviceInfo.getVersion();
          item.baseData.properties.DeviceId = DeviceInfo.getUniqueIdSync();
          item.baseData.properties.PlatformOS = Platform.OS;
          item.baseData.properties.PlatformVersion = Platform.Version.toString();
        }
        const currentUser = this.getUserFn?.();
        if (currentUser) {
          const accountId = currentUser['https://claims.softwareone.com/accountId'];
          if (accountId) {
            item.tags = item.tags || [];
            item.tags['ai.user.accountId'] = accountId as string;
          }
        }

        return true;
      });

      this.isInitialized = true;

      console.info('[AppInsights] Initialized successfully');

      this.trackEvent({
        name: 'MPT_Mobile_App_Started',
        properties: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('[AppInsights] Failed to initialize:', error);
    }
  }

  public setUserProvider(getUserFn: () => User | null): void {
    this.getUserFn = getUserFn;
  }

  private getTraceId(): string {
    const context = this.appInsights?.context;
    const traceId = context?.telemetryTrace?.traceID || Crypto.randomUUID();
    return traceId.replace(/-/g, '');
  }

  /**
   * Get traceparent header for W3C distributed tracing
   * Format: 00-<trace-id>-<span-id>-<trace-flags>
   * This is compatible with .NET Application Insights SDK
   */
  public getTraceparent(): string | null {
    if (!this.isInitialized || !this.appInsights) {
      return null;
    }

    const context = this.appInsights.context;
    if (!context) {
      return null;
    }

    // Get normalized trace ID and generate unique span ID per request
    const normalizedTraceId = this.getTraceId();
    const spanId = Crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    // Format: version-traceId-spanId-flags
    // version: 00 (current W3C spec)
    // flags: 01 (sampled)
    return `00-${normalizedTraceId}-${spanId}-01`;
  }

  /**
   * Get Request-Id header for Application Insights correlation
   * Format: |<operation-id>.<request-id>
   */
  public getRequestId(): string | null {
    if (!this.isInitialized || !this.appInsights) {
      return null;
    }

    const operationId = this.getTraceId();
    const requestId = Crypto.randomUUID().replace(/-/g, '').substring(0, 8);

    return `|${operationId}.${requestId}`;
  }

  public trackEvent(event: AppInsightsEvent): void {
    if (!this.isInitialized || !this.appInsights) {
      console.warn('[AppInsights] Not initialized. Event not tracked:', event.name);
      return;
    }

    this.appInsights.trackEvent({ name: event.name }, event.properties);
    console.info('[AppInsights] Event tracked:', event.name);
  }

  public trackException(
    error: Error,
    properties?: CustomProperties,
    severityLevel: SeverityLevel = 'Error',
  ): void {
    if (!this.isInitialized || !this.appInsights) {
      console.warn('[AppInsights] Not initialized. Exception not tracked:', error.message);
      return;
    }

    const severityMap: Record<SeverityLevel, number> = {
      Verbose: 0,
      Information: 1,
      Warning: 2,
      Error: 3,
      Critical: 4,
    };

    this.appInsights.trackException({
      exception: error,
      severityLevel: severityMap[severityLevel],
      properties,
    });
  }

  public trackTrace(
    message: string,
    severityLevel: SeverityLevel = 'Information',
    properties?: CustomProperties,
  ): void {
    if (!this.isInitialized || !this.appInsights) {
      console.warn('[AppInsights] Not initialized. Trace not tracked:', message);
      return;
    }

    const severityMap: Record<SeverityLevel, number> = {
      Verbose: 0,
      Information: 1,
      Warning: 2,
      Error: 3,
      Critical: 4,
    };

    this.appInsights.trackTrace({
      message,
      severityLevel: severityMap[severityLevel],
      properties,
    });
    console.info('[AppInsights] Trace tracked:', message.substring(0, 50) + '...');
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

export const appInsightsService = new AppInsightsService();
export { AppInsightsService };
