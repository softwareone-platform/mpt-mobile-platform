export const appInsightsService = {
  trackEvent: jest.fn(),
  trackException: jest.fn(),
  trackTrace: jest.fn(),
  trackPageView: jest.fn(),
  trackMetric: jest.fn(),
};
