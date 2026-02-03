import { AppInsightsService } from '@/services/appInsightsService';

const mockLoadAppInsights = jest.fn();
const mockAddTelemetryInitializer = jest.fn();
const mockTrackEvent = jest.fn();
const mockTrackException = jest.fn();
const mockTrackTrace = jest.fn();
const mockTrackMetric = jest.fn();
const mockTrackPageView = jest.fn();
const mockSetAuthenticatedUserContext = jest.fn();
const mockClearAuthenticatedUserContext = jest.fn();
const mockFlush = jest.fn();

jest.mock('react-native-device-info', () => ({
  default: {
    getVersion: jest.fn(() => '1.3.4'),
  },
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  Version: 17,
  select: jest.fn((obj) => obj.ios),
}));

jest.mock('@microsoft/applicationinsights-web', () => ({
  ApplicationInsights: jest.fn().mockImplementation(() => ({
    loadAppInsights: mockLoadAppInsights,
    addTelemetryInitializer: mockAddTelemetryInitializer,
    trackEvent: mockTrackEvent,
    trackException: mockTrackException,
    trackTrace: mockTrackTrace,
    trackMetric: mockTrackMetric,
    trackPageView: mockTrackPageView,
    setAuthenticatedUserContext: mockSetAuthenticatedUserContext,
    clearAuthenticatedUserContext: mockClearAuthenticatedUserContext,
    flush: mockFlush,
  })),
}));

jest.mock('@microsoft/applicationinsights-react-native', () => ({
  ReactNativePlugin: jest.fn(),
}));

jest.mock('@/config/env.config', () => ({
  configService: {
    get: jest.fn((key: string) => {
      if (key === 'APPLICATION_INSIGHTS_CONNECTION_STRING') {
        return 'InstrumentationKey=test-key;IngestionEndpoint=https://test.com';
      }
      return '';
    }),
  },
}));

describe('AppInsightsService', () => {
  let service: AppInsightsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppInsightsService();
  });

  describe('initialize', () => {
    it('should initialize successfully', () => {
      service.initialize();
      expect(mockLoadAppInsights).toHaveBeenCalled();
      expect(mockAddTelemetryInitializer).toHaveBeenCalled();
      expect(service.isReady()).toBe(true);
    });

    it('should not initialize twice', () => {
      service.initialize();
      service.initialize();
      expect(mockLoadAppInsights).toHaveBeenCalledTimes(1);
    });

    it('should handle missing connection string gracefully', () => {
      const { configService } = require('@/config/env.config');
      configService.get.mockReturnValueOnce('');

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      service.initialize();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[AppInsights] Connection string not found. Telemetry will be disabled.',
      );
      expect(mockLoadAppInsights).not.toHaveBeenCalled();
      expect(service.isReady()).toBe(false);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('setUserProvider', () => {
    it('should set user provider function', () => {
      const mockUser = { sub: 'test-user' };
      const getUserFn = () => mockUser;
      service.setUserProvider(getUserFn);
      expect(service).toBeDefined();
    });
  });

  describe('trackEvent', () => {
    it('should track event when initialized', () => {
      service.initialize();
      service.trackEvent({ name: 'TestEvent', properties: { key: 'value' } });
      expect(mockTrackEvent).toHaveBeenCalledWith({ name: 'TestEvent' }, { key: 'value' });
    });

    it('should not track event when not initialized', () => {
      service.trackEvent({ name: 'TestEvent' });
      expect(mockTrackEvent).not.toHaveBeenCalled();
    });
  });

  describe('trackException', () => {
    it('should track exception when initialized', () => {
      service.initialize();
      const error = new Error('Test error');
      service.trackException(error);
      expect(mockTrackException).toHaveBeenCalled();
    });

    it('should not track exception when not initialized', () => {
      const error = new Error('Test error');
      service.trackException(error);
      expect(mockTrackException).not.toHaveBeenCalled();
    });
  });

  describe('trackTrace', () => {
    it('should track trace when initialized', () => {
      service.initialize();
      service.trackTrace('Test message', 'Information', { key: 'value' });
      expect(mockTrackTrace).toHaveBeenCalled();
    });

    it('should not track trace when not initialized', () => {
      service.trackTrace('Test message');
      expect(mockTrackTrace).not.toHaveBeenCalled();
    });
  });

  describe('trackMetric', () => {
    it('should track metric when initialized', () => {
      service.initialize();
      service.trackMetric({ name: 'TestMetric', average: 100 });
      expect(mockTrackMetric).toHaveBeenCalled();
    });

    it('should not track metric when not initialized', () => {
      service.trackMetric({ name: 'TestMetric', average: 100 });
      expect(mockTrackMetric).not.toHaveBeenCalled();
    });
  });

  describe('trackPageView', () => {
    it('should track page view when initialized', () => {
      service.initialize();
      service.trackPageView('TestScreen', { key: 'value' });
      expect(mockTrackPageView).toHaveBeenCalledWith({
        name: 'TestScreen',
        properties: { key: 'value' },
      });
    });

    it('should not track page view when not initialized', () => {
      service.trackPageView('TestScreen');
      expect(mockTrackPageView).not.toHaveBeenCalled();
    });
  });

  describe('setAuthenticatedUserContext', () => {
    it('should set authenticated user context when initialized', () => {
      service.initialize();
      service.setAuthenticatedUserContext('user123', 'account456');
      expect(mockSetAuthenticatedUserContext).toHaveBeenCalledWith('user123', 'account456');
    });

    it('should not set user context when not initialized', () => {
      service.setAuthenticatedUserContext('user123');
      expect(mockSetAuthenticatedUserContext).not.toHaveBeenCalled();
    });
  });

  describe('clearAuthenticatedUserContext', () => {
    it('should clear authenticated user context when initialized', () => {
      service.initialize();
      service.clearAuthenticatedUserContext();
      expect(mockClearAuthenticatedUserContext).toHaveBeenCalled();
    });

    it('should not clear user context when not initialized', () => {
      service.clearAuthenticatedUserContext();
      expect(mockClearAuthenticatedUserContext).not.toHaveBeenCalled();
    });
  });

  describe('updateAuthenticatedUserContext', () => {
    it('should set user context when userId is provided', () => {
      service.initialize();
      service.updateAuthenticatedUserContext('user123');
      expect(mockSetAuthenticatedUserContext).toHaveBeenCalledWith('user123', undefined);
    });

    it('should clear user context when userId is null', () => {
      service.initialize();
      service.updateAuthenticatedUserContext(null);
      expect(mockClearAuthenticatedUserContext).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should flush telemetry', async () => {
      service.initialize();
      await service.shutdown();
      expect(mockFlush).toHaveBeenCalled();
    });
  });

  describe('isReady', () => {
    it('should return false when not initialized', () => {
      expect(service.isReady()).toBe(false);
    });

    it('should return true when initialized', () => {
      service.initialize();
      expect(service.isReady()).toBe(true);
    });
  });
});
