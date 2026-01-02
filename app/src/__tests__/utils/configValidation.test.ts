import {
  isTestEnvironment,
  validateRequiredVars,
  formatValidationError,
} from '@/utils/configValidation';

describe('configValidation utils', () => {
  describe('isTestEnvironment', () => {
    it('should return true in Jest environment', () => {
      expect(isTestEnvironment()).toBe(true);
      expect(process.env.JEST_WORKER_ID).toBeDefined();
    });
  });

  describe('validateRequiredVars', () => {
    it('should return empty array when all required vars are present', () => {
      const config = { VAR1: 'value1', VAR2: 'value2' };
      const required = ['VAR1', 'VAR2'];

      expect(validateRequiredVars(config, required)).toEqual([]);
    });

    it('should return missing vars when some are undefined', () => {
      const config = { VAR1: 'value1', VAR2: undefined };
      const required = ['VAR1', 'VAR2', 'VAR3'];

      expect(validateRequiredVars(config, required)).toEqual(['VAR2', 'VAR3']);
    });

    it('should return missing vars when some are empty strings', () => {
      const config = { VAR1: '', VAR2: 'value2' };
      const required = ['VAR1', 'VAR2'];

      expect(validateRequiredVars(config, required)).toEqual(['VAR1']);
    });

    it('should handle empty required vars array', () => {
      const config = { VAR1: 'value1' };

      expect(validateRequiredVars(config, [])).toEqual([]);
    });
  });

  describe('formatValidationError', () => {
    it('should format error message with single missing var', () => {
      const result = formatValidationError(['AUTH0_DOMAIN']);

      expect(result).toContain('CONFIGURATION ERROR');
      expect(result).toContain('AUTH0_DOMAIN');
      expect(result).toContain('.env');
      expect(result).toContain('restart Metro');
    });

    it('should format error message with multiple missing vars', () => {
      const result = formatValidationError(['VAR1', 'VAR2', 'VAR3']);

      expect(result).toContain('VAR1');
      expect(result).toContain('VAR2');
      expect(result).toContain('VAR3');
    });
  });
});
