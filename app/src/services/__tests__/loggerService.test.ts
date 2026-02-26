import { appInsightsService } from '../appInsightsService';
import { LoggerService } from '../loggerService';

import { configService } from '@/config/env.config';

jest.mock('../appInsightsService');
jest.mock('@/config/env.config');

const mockConfigService = configService as jest.Mocked<typeof configService>;
const mockAppInsightsService = appInsightsService as jest.Mocked<typeof appInsightsService>;

describe('loggerService', () => {
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let logger: LoggerService;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAppInsightsService.isReady = jest.fn().mockReturnValue(false);
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('environment configuration', () => {
    it('returns correct config for debug level', () => {
      mockConfigService.get.mockReturnValue('debug');
      logger = new LoggerService();

      const config = logger.getConfig();

      expect(config.configuredLevel).toBe('debug');
      expect(config.enabledLevels).toEqual(['debug', 'info', 'warn', 'error']);
    });

    it('returns correct config for info level (default)', () => {
      mockConfigService.get.mockReturnValue('info');
      logger = new LoggerService();

      const config = logger.getConfig();

      expect(config.configuredLevel).toBe('info');
      expect(config.enabledLevels).toEqual(['info', 'warn', 'error']);
    });

    it('returns correct config for warn level', () => {
      mockConfigService.get.mockReturnValue('warn');
      logger = new LoggerService();

      const config = logger.getConfig();

      expect(config.configuredLevel).toBe('warn');
      expect(config.enabledLevels).toEqual(['warn', 'error']);
    });

    it('returns correct config for error level', () => {
      mockConfigService.get.mockReturnValue('error');
      logger = new LoggerService();

      const config = logger.getConfig();

      expect(config.configuredLevel).toBe('error');
      expect(config.enabledLevels).toEqual(['error']);
    });

    it('defaults to info level when LOG_LEVEL is not set', () => {
      mockConfigService.get.mockReturnValue('');
      logger = new LoggerService();

      const config = logger.getConfig();

      expect(config.configuredLevel).toBe('info');
      expect(config.enabledLevels).toEqual(['info', 'warn', 'error']);
    });
  });

  describe('log level filtering', () => {
    it('logs all levels with debug level', () => {
      mockConfigService.get.mockReturnValue('debug');
      logger = new LoggerService();

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('filters debug logs with info level', () => {
      mockConfigService.get.mockReturnValue('info');
      logger = new LoggerService();

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1); // only info
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('filters debug and info logs with warn level', () => {
      mockConfigService.get.mockReturnValue('warn');
      logger = new LoggerService();

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(0);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('only logs errors with error level', () => {
      mockConfigService.get.mockReturnValue('error');
      logger = new LoggerService();

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('message formatting', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('info');
      logger = new LoggerService();
    });

    it('formats message with category', () => {
      logger.info('test message', { category: 'auth' });

      expect(consoleInfoSpy).toHaveBeenCalledWith('[AUTH] test message', {});
    });

    it('formats message with component', () => {
      logger.info('test message', { component: 'AuthService' });

      expect(consoleInfoSpy).toHaveBeenCalledWith('[AuthService] test message', {});
    });

    it('formats message with screen', () => {
      logger.info('test message', { screen: 'WelcomeScreen' });

      expect(consoleInfoSpy).toHaveBeenCalledWith('[WelcomeScreen] test message', {});
    });

    it('formats message with all context fields', () => {
      logger.info('test message', {
        category: 'auth',
        component: 'AuthService',
        screen: 'WelcomeScreen',
      });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[AUTH] [AuthService] [WelcomeScreen] test message',
        expect.any(Object),
      );
    });

    it('includes additional context in log output', () => {
      logger.info('test message', {
        category: 'auth',
        userId: '123',
        accountId: '456',
      });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[AUTH] test message',
        expect.objectContaining({
          userId: '123',
          accountId: '456',
        }),
      );
    });
  });

  describe('AppInsights integration', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('debug');
      logger = new LoggerService();
      mockAppInsightsService.isReady.mockReturnValue(true);
    });

    it('sends warn logs to AppInsights', () => {
      logger.warn('warning message', { category: 'auth' });

      expect(mockAppInsightsService.trackTrace).toHaveBeenCalledWith(
        '[AUTH] warning message',
        'Warning',
        {},
      );
    });

    it('sends error logs to AppInsights', () => {
      logger.error('error message', undefined, { category: 'auth' });

      expect(mockAppInsightsService.trackTrace).toHaveBeenCalledWith(
        '[AUTH] error message',
        'Error',
        {},
      );
    });

    it('sends debug logs to AppInsights with debug level', () => {
      logger.debug('debug message');

      expect(mockAppInsightsService.trackTrace).toHaveBeenCalledWith(
        'debug message',
        'Verbose',
        undefined,
      );
    });

    it('sends info logs to AppInsights with debug level', () => {
      logger.info('info message', { category: 'auth' });

      expect(mockAppInsightsService.trackTrace).toHaveBeenCalledWith(
        '[AUTH] info message',
        'Information',
        {},
      );
    });

    it('does not send info logs to AppInsights with warn level', () => {
      mockConfigService.get.mockReturnValue('warn');
      const warnLogger = new LoggerService();
      mockAppInsightsService.isReady.mockReturnValue(true);

      warnLogger.info('info message');

      expect(mockAppInsightsService.trackTrace).not.toHaveBeenCalled();
    });

    it('does not send info logs to AppInsights with error level', () => {
      mockConfigService.get.mockReturnValue('error');
      const errorLogger = new LoggerService();
      mockAppInsightsService.isReady.mockReturnValue(true);

      errorLogger.info('info message');

      expect(mockAppInsightsService.trackTrace).not.toHaveBeenCalled();
    });

    it('tracks exception for error with Error object', () => {
      const error = new Error('Test error');

      logger.error('operation failed', error, { category: 'api' });

      expect(mockAppInsightsService.trackException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          errorStack: error.stack,
          errorName: 'Error',
        }),
        'Error',
      );
    });

    it('does not track exception when AppInsights is not ready', () => {
      mockAppInsightsService.isReady.mockReturnValue(false);
      const error = new Error('Test error');

      logger.error('operation failed', error);

      expect(mockAppInsightsService.trackException).not.toHaveBeenCalled();
    });
  });

  describe('error logging', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('info');
      logger = new LoggerService();
      mockAppInsightsService.isReady.mockReturnValue(true);
    });

    it('logs error message without error object', () => {
      logger.error('operation failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith('operation failed', expect.any(Object));
    });

    it('logs error message with error object', () => {
      const error = new Error('Test error');

      logger.error('operation failed', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'operation failed: Test error',
        expect.objectContaining({
          errorStack: error.stack,
          errorName: 'Error',
        }),
      );
    });

    it('logs error message with non-Error object', () => {
      logger.error('operation failed', 'string error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('operation failed', expect.any(Object));
    });
  });

  describe('trace (critical events)', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('error');
      logger = new LoggerService();
      mockAppInsightsService.isReady.mockReturnValue(true);
    });

    it('always logs with error level', () => {
      logger.trace('Account switched', { category: 'auth', accountId: '123' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[AUTH] Account switched',
        expect.objectContaining({
          accountId: '123',
        }),
      );
    });

    it('always sends to AppInsights with error level', () => {
      logger.trace('User logged in', { category: 'auth', userId: '456' });

      expect(mockAppInsightsService.trackTrace).toHaveBeenCalledWith(
        '[AUTH] User logged in',
        'Information',
        expect.objectContaining({
          userId: '456',
        }),
      );
    });

    it('logs even when AppInsights is not ready', () => {
      mockAppInsightsService.isReady.mockReturnValue(false);

      logger.trace('Critical event', { category: 'general' });

      expect(consoleInfoSpy).toHaveBeenCalledWith('[GENERAL] Critical event', {});
      expect(mockAppInsightsService.trackTrace).not.toHaveBeenCalled();
    });

    it('works with all log levels', () => {
      mockConfigService.get.mockReturnValue('info');
      logger = new LoggerService();

      logger.trace('Test event');

      expect(consoleInfoSpy).toHaveBeenCalledWith('Test event', '');
    });
  });

  describe('isEnabled', () => {
    it('returns true for enabled levels with info level', () => {
      mockConfigService.get.mockReturnValue('info');
      logger = new LoggerService();

      expect(logger.isEnabled('debug')).toBe(false);
      expect(logger.isEnabled('info')).toBe(true);
      expect(logger.isEnabled('warn')).toBe(true);
      expect(logger.isEnabled('error')).toBe(true);
      expect(logger.isEnabled('trace')).toBe(true); // always true
    });

    it('returns false for disabled levels with error level', () => {
      mockConfigService.get.mockReturnValue('error');
      logger = new LoggerService();

      expect(logger.isEnabled('debug')).toBe(false);
      expect(logger.isEnabled('info')).toBe(false);
      expect(logger.isEnabled('warn')).toBe(false);
      expect(logger.isEnabled('error')).toBe(true);
      expect(logger.isEnabled('trace')).toBe(true); // always true
    });
  });
});
