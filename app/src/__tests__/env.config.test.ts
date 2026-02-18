import { configService } from '../config/env.config';

// Mock the configValidation utils
jest.mock('@/utils/configValidation', () => ({
  isTestEnvironment: jest.fn(() => true), // Default to test environment
  validateRequiredVars: jest.fn(() => []),
  formatValidationError: jest.fn((vars) => `Missing required variables: ${vars.join(', ')}`),
}));

import * as configValidation from '@/utils/configValidation';

describe('ConfigService', () => {
  describe('get', () => {
    it('should return config values', () => {
      const domain = configService.get('AUTH0_DOMAIN');
      expect(typeof domain).toBe('string');
    });

    it('should return empty string for missing optional values', () => {
      const value = configService.get('AUTH0_AUDIENCE');
      expect(typeof value).toBe('string');
    });
  });

  describe('getAll', () => {
    it('should return all config values', () => {
      const config = configService.getAll();

      expect(config).toBeDefined();
      expect(config).toHaveProperty('AUTH0_DOMAIN');
      expect(config).toHaveProperty('AUTH0_CLIENT_ID');
      expect(config).toHaveProperty('AUTH0_SCOPE');
    });

    it('should return immutable copy', () => {
      const config1 = configService.getAll();
      const config2 = configService.getAll();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update config values', () => {
      configService.update({ AUTH0_DOMAIN: 'new-domain.com' });

      const domain = configService.get('AUTH0_DOMAIN');
      expect(domain).toBe('new-domain.com');
    });

    it('should validate config after update in non-test environment', () => {
      const mockIsTestEnv = configValidation.isTestEnvironment as jest.Mock;
      const mockValidateRequiredVars = configValidation.validateRequiredVars as jest.Mock;

      // Simulate non-test environment
      mockIsTestEnv.mockReturnValue(false);
      mockValidateRequiredVars.mockReturnValue([]);

      configService.update({ AUTH0_API_URL: 'https://new-api.com' });

      expect(mockValidateRequiredVars).toHaveBeenCalled();
    });

    it('should throw error when validation fails after update', () => {
      const mockIsTestEnv = configValidation.isTestEnvironment as jest.Mock;
      const mockValidateRequiredVars = configValidation.validateRequiredVars as jest.Mock;
      const mockFormatValidationError = configValidation.formatValidationError as jest.Mock;
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Simulate non-test environment with missing vars
      mockIsTestEnv.mockReturnValue(false);
      mockValidateRequiredVars.mockReturnValue(['AUTH0_DOMAIN', 'AUTH0_CLIENT_ID']);
      mockFormatValidationError.mockReturnValue(
        'Missing required variables: AUTH0_DOMAIN, AUTH0_CLIENT_ID',
      );

      expect(() => {
        configService.update({ AUTH0_DOMAIN: '' });
      }).toThrow('Missing required variables: AUTH0_DOMAIN, AUTH0_CLIENT_ID');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Missing required variables: AUTH0_DOMAIN, AUTH0_CLIENT_ID',
      );

      consoleErrorSpy.mockRestore();
    });

    it('should skip validation in test environment', () => {
      const mockIsTestEnv = configValidation.isTestEnvironment as jest.Mock;
      const mockValidateRequiredVars = configValidation.validateRequiredVars as jest.Mock;

      // Ensure we're in test environment
      mockIsTestEnv.mockReturnValue(true);

      configService.update({ AUTH0_DOMAIN: 'test-domain.com' });

      // validateConfig should not be called in test environment
      expect(mockValidateRequiredVars).not.toHaveBeenCalled();
    });
  });
});
