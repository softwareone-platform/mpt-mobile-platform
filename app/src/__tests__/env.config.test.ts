import { configService } from '../config/env.config';

describe('ConfigService', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('isTestEnvironment', () => {
    it('should skip validation in test environment', () => {
      // In Jest, JEST_WORKER_ID is set, so validation should be skipped
      expect(process.env.JEST_WORKER_ID).toBeDefined();
      expect(() => configService.get('AUTH0_DOMAIN')).not.toThrow();
    });

    it('should allow getting config values even when validation is skipped', () => {
      expect(() => configService.get('AUTH0_DOMAIN')).not.toThrow();
    });

    it('should return empty string for missing optional values', () => {
      const apiUrl = configService.get('AUTH0_API_URL');
      expect(typeof apiUrl).toBe('string');
    });
  });

  describe('get', () => {
    it('should return string values', () => {
      const domain = configService.get('AUTH0_DOMAIN');
      expect(typeof domain).toBe('string');
    });

    it('should return empty string for missing optional values', () => {
      const value = configService.get('AUTH0_AUDIENCE');
      expect(typeof value).toBe('string');
    });

    it('should get AUTH0_CLIENT_ID', () => {
      const value = configService.get('AUTH0_CLIENT_ID');
      expect(typeof value).toBe('string');
    });

    it('should get AUTH0_SCOPE', () => {
      const value = configService.get('AUTH0_SCOPE');
      expect(typeof value).toBe('string');
    });

    it('should get AUTH0_OTP_DIGITS', () => {
      const value = configService.get('AUTH0_OTP_DIGITS');
      expect(typeof value).toBe('string');
    });

    it('should get AUTH0_SCHEME', () => {
      const value = configService.get('AUTH0_SCHEME');
      expect(typeof value).toBe('string');
    });

    it('should return empty string for undefined optional variables', () => {
      // AUTH0_API_URL is optional
      const value = configService.get('AUTH0_API_URL');
      expect(typeof value).toBe('string');
    });
  });

  describe('getAll', () => {
    it('should return config object', () => {
      const config = configService.getAll();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should return readonly config', () => {
      const config = configService.getAll();
      expect(config).not.toBe((configService as any).config);
    });

    it('should return config with all environment variables', () => {
      const config = configService.getAll();
      expect(config).toHaveProperty('AUTH0_DOMAIN');
      expect(config).toHaveProperty('AUTH0_CLIENT_ID');
      expect(config).toHaveProperty('AUTH0_AUDIENCE');
      expect(config).toHaveProperty('AUTH0_SCOPE');
      expect(config).toHaveProperty('AUTH0_API_URL');
      expect(config).toHaveProperty('AUTH0_OTP_DIGITS');
      expect(config).toHaveProperty('AUTH0_SCHEME');
    });

    it('should return a copy of config object', () => {
      const config1 = configService.getAll();
      const config2 = configService.getAll();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });

    it('should return immutable config', () => {
      const config = configService.getAll();
      const originalDomain = config.AUTH0_DOMAIN;
      
      // Attempt to modify (TypeScript prevents this, but test runtime behavior)
      (config as any).AUTH0_DOMAIN = 'modified';
      
      // Get config again and verify it's not modified
      const newConfig = configService.getAll();
      expect(newConfig.AUTH0_DOMAIN).toBe(originalDomain);
    });
  });

  describe('environment variables validation', () => {
    it('should handle all required variables being present in test environment', () => {
      // Test environment should not throw even if variables are missing
      expect(() => {
        configService.get('AUTH0_DOMAIN');
        configService.get('AUTH0_CLIENT_ID');
        configService.get('AUTH0_SCOPE');
        configService.get('AUTH0_SCHEME');
      }).not.toThrow();
    });

    it('should handle optional variables gracefully', () => {
      const audience = configService.get('AUTH0_AUDIENCE');
      const apiUrl = configService.get('AUTH0_API_URL');
      const otpDigits = configService.get('AUTH0_OTP_DIGITS');
      
      expect(typeof audience).toBe('string');
      expect(typeof apiUrl).toBe('string');
      expect(typeof otpDigits).toBe('string');
    });
  });

  describe('config loading', () => {
    it('should load all environment variable types', () => {
      const config = configService.getAll();
      
      // Check all variable types are loaded
      expect(config).toBeDefined();
      expect(Object.keys(config)).toContain('AUTH0_DOMAIN');
      expect(Object.keys(config)).toContain('AUTH0_CLIENT_ID');
      expect(Object.keys(config)).toContain('AUTH0_AUDIENCE');
      expect(Object.keys(config)).toContain('AUTH0_SCOPE');
      expect(Object.keys(config)).toContain('AUTH0_API_URL');
      expect(Object.keys(config)).toContain('AUTH0_OTP_DIGITS');
      expect(Object.keys(config)).toContain('AUTH0_SCHEME');
    });
  });

  describe('error handling', () => {
    it('should not throw in test environment for missing required variables', () => {
      // In test environment, even required vars don't throw
      expect(() => configService.get('AUTH0_DOMAIN')).not.toThrow();
      expect(() => configService.get('AUTH0_CLIENT_ID')).not.toThrow();
      expect(() => configService.get('AUTH0_SCOPE')).not.toThrow();
      expect(() => configService.get('AUTH0_SCHEME')).not.toThrow();
    });
  });
});
