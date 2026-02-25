import { AppInsightsService } from '@/services/appInsightsService';

const mockLoadAppInsights = jest.fn();
const mockAddTelemetryInitializer = jest.fn();
const mockTrackEvent = jest.fn();
const mockTrackException = jest.fn();
const mockTrackTrace = jest.fn();

const mockGetVersion = jest.fn(() => '1.3.4');
const mockGetUniqueIdSync = jest.fn(() => 'test-device-id-abc123');

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-123'),
}));

jest.mock('react-native-device-info', () => ({
  default: {
    getVersion: mockGetVersion,
    getUniqueIdSync: mockGetUniqueIdSync,
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
    context: {
      telemetryTrace: {
        traceID: 'test-trace-id-abc123',
      },
      sessionManager: {
        automaticSession: {
          id: 'test-session-id-xyz789',
        },
      },
    },
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

    it('should register telemetry initializer with user context', () => {
      const mockUser = {
        sub: 'test-user',
        'https://claims.softwareone.com/accountId': 'ACC-TEST-123',
      };

      service.setUserProvider(() => mockUser);
      service.initialize();

      // Verify telemetry initializer was registered
      expect(mockAddTelemetryInitializer).toHaveBeenCalled();
      expect(mockAddTelemetryInitializer.mock.calls[0][0]).toBeInstanceOf(Function);
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

  describe('isReady', () => {
    it('should return false when not initialized', () => {
      expect(service.isReady()).toBe(false);
    });

    it('should return true when initialized', () => {
      service.initialize();
      expect(service.isReady()).toBe(true);
    });
  });

  describe('getTraceparent', () => {
    it('should return null when not initialized', () => {
      expect(service.getTraceparent()).toBeNull();
    });

    it('should return traceparent header when initialized', () => {
      service.initialize();
      const traceparent = service.getTraceparent();
      expect(traceparent).not.toBeNull();
      expect(traceparent).toContain('00-');
      expect(traceparent).toContain('-01');
    });
  });

  describe('getRequestId', () => {
    it('should return null when not initialized', () => {
      expect(service.getRequestId()).toBeNull();
    });

    it('should return Request-Id header when initialized', () => {
      service.initialize();
      const requestId = service.getRequestId();
      expect(requestId).not.toBeNull();
      expect(requestId).toContain('|');
      expect(requestId).toContain('.');
    });
  });
});
