import { ReactNativePlugin } from '@microsoft/applicationinsights-react-native';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import { configService } from '@/config/env.config';

export type SeverityLevel = 'Verbose' | 'Information' | 'Warning' | 'Error' | 'Critical';

export interface CustomProperties {
  [key: string]: string | number | boolean | undefined;
}

export interface AppInsightsEvent {
  name: string;
  properties?: CustomProperties;
}

export interface AppInsightsMetric {
  name: string;
  average: number;
  sampleCount?: number;
  min?: number;
  max?: number;
  properties?: CustomProperties;
}

const APPLICATION_NAME = 'MarketplaceMobile';

/**
 * Application Insights service for React Native
 * Uses official Microsoft Application Insights React Native plugin
 */
class AppInsightsService {
  private appInsights: ApplicationInsights | null = null;
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

      this.appInsights.addTelemetryInitializer((item) => {
        if (item.baseData) {
          item.baseData.properties = item.baseData.properties || {};
          item.baseData.properties.Application = APPLICATION_NAME;
        }
        return true;
      });

      this.isInitialized = true;

      console.info('[AppInsights] Initialized successfully');

      // Send initial test event
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

  /**
   * Track a custom event
   * @param event - Event name and optional properties
   */
  public trackEvent(event: AppInsightsEvent): void {
    if (!this.isInitialized || !this.appInsights) {
      console.warn('[AppInsights] Not initialized. Event not tracked:', event.name);
      return;
    }

    this.appInsights.trackEvent({ name: event.name }, event.properties);
    console.info('[AppInsights] Event tracked:', event.name);
  }

  /**
   * Track an exception/error
   * @param error - The error object
   * @param properties - Additional custom properties
   * @param severityLevel - Severity level of the error
   */
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

  /**
   * Track a trace/log message
   * @param message - The log message
   * @param severityLevel - Severity level
   * @param properties - Additional custom properties
   */
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

  /**
   * Track a custom metric
   * @param metric - Metric data
   */
  public trackMetric(metric: AppInsightsMetric): void {
    if (!this.isInitialized || !this.appInsights) {
      console.warn('[AppInsights] Not initialized. Metric not tracked:', metric.name);
      return;
    }

    this.appInsights.trackMetric(
      {
        name: metric.name,
        average: metric.average,
        sampleCount: metric.sampleCount,
        min: metric.min,
        max: metric.max,
      },
      metric.properties,
    );
  }

  /**
   * Track a page view (screen view in mobile context)
   * @param name - Screen/page name
   * @param properties - Additional custom properties
   */
  public trackPageView(name: string, properties?: CustomProperties): void {
    if (!this.isInitialized || !this.appInsights) {
      console.warn('[AppInsights] Not initialized. Page view not tracked:', name);
      return;
    }

    this.appInsights.trackPageView({ name, properties });
  }

  /**
   * Set the authenticated user ID for correlation
   * @param userId - The user identifier
   * @param accountId - Optional account identifier
   */
  public setAuthenticatedUserContext(userId: string, accountId?: string): void {
    if (!this.isInitialized || !this.appInsights) {
      console.warn('[AppInsights] Not initialized. User context not set.');
      return;
    }

    this.appInsights.setAuthenticatedUserContext(userId, accountId);
  }

  /**
   * Clear the authenticated user context (e.g., on logout)
   */
  public clearAuthenticatedUserContext(): void {
    if (!this.isInitialized || !this.appInsights) {
      return;
    }

    this.appInsights.clearAuthenticatedUserContext();
  }

  /**
   * Flush pending telemetry
   */
  public async shutdown(): Promise<void> {
    if (this.appInsights) {
      await this.appInsights.flush();
      console.info('[AppInsights] Flushed pending telemetry');
    }
  }

  /**
   * Check if Application Insights is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const appInsightsService = new AppInsightsService();

// Export class for testing purposes
export { AppInsightsService };
