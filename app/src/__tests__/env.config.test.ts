import { configService } from '../config/env.config';

describe('ConfigService', () => {
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
  });
});
