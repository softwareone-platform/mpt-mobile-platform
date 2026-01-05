import { configService } from '../config/env.config';

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
});
