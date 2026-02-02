# Application Insights for React Native

This application uses the official Microsoft Application Insights React Native plugin.

## Architecture

- **Microsoft Application Insights SDK**: Official React Native plugin (`@microsoft/applicationinsights-react-native`)
- **Device Info Collection**: Uses `react-native-device-info` for automatic device metadata
- **Expo Development Build**: Works with Expo development builds (native modules supported)

## Setup

The service is already initialized in `App.tsx` via the `useAppInsights` hook.

## Usage

```typescript
import { appInsightsService } from '@/services/appInsightsService';

// Track custom events
appInsightsService.trackEvent({
  name: 'UserAction',
  properties: {
    action: 'button_click',
    screen: 'home',
  },
});

// Track exceptions
try {
  // ... code
} catch (error) {
  appInsightsService.trackException(
    error as Error,
    { context: 'payment_flow' },
    'Error',
  );
}

// Track trace/logs
appInsightsService.trackTrace(
  'User logged in successfully',
  'Information',
  { userId: '123' },
);

// Track metrics
appInsightsService.trackMetric({
  name: 'api_response_time',
  average: 250,
  properties: { endpoint: '/api/users' },
});

// Track page/screen views
appInsightsService.trackPageView('HomeScreen', {
  source: 'navigation',
});
```

## Finding Data in Azure Portal

### Events
Search for event names like:
- `MPT_Mobile_App_Started`
- `MPT_Mobile_App_Mounted`

### Traces
Look for traces with your custom messages in the "Traces" section

### Metrics
Custom metrics appear in the "Metrics" explorer

### Application Map
View distributed traces and dependencies in the Application Map

## Development vs Production

- In development (`__DEV__`), telemetry is also logged to console
- In production, only sent to Azure

## Troubleshooting

If data doesn't appear:

1. Check console logs for initialization messages
2. Verify `APPLICATION_INSIGHTS_CONNECTION_STRING` is set in `.env`
3. Check Azure portal after a few minutes (ingestion delay)
4. Look for errors in console starting with `[AppInsights]`

## Azure Configuration

The connection string is passed directly to the Microsoft SDK, which handles all parsing and formatting automatically.

Format:
```
InstrumentationKey=xxx;IngestionEndpoint=https://region.in.applicationinsights.azure.com/;...
```

The SDK automatically collects device information (model, OS, unique ID) via `react-native-device-info`.
