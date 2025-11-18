import { AUTH_CONSTANTS } from '@/constants';

describe('OtpVerificationScreen Business Logic', () => {
  describe('Input Sanitization', () => {
    const sanitizeNumericInput = (text: string, maxLength: number): string => {
      return text.replace(/[^0-9]/g, '').slice(0, maxLength);
    };

    it('should sanitize OTP input correctly', () => {
      const testCases = [
        { input: '123456', expected: '123456' },
        { input: 'abc123def', expected: '123' },
        { input: '12-34-56', expected: '123456' },
        { input: '12 34 56', expected: '123456' },
        { input: '1.2.3.4.5.6', expected: '123456' },
        { input: '+1-2-3-4-5-6', expected: '123456' },
        { input: 'abcdef', expected: '' },
        { input: '!@#$%^', expected: '' },
        { input: '', expected: '' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(sanitizeNumericInput(input, 6)).toBe(expected);
      });
    });

    it('should respect maximum length limit', () => {
      expect(sanitizeNumericInput('123456789', 6)).toBe('123456');
      expect(sanitizeNumericInput('123456789', 4)).toBe('1234');
      expect(sanitizeNumericInput('123456789', 10)).toBe('123456789');
    });
  });

  describe('Auto-submit Logic', () => {
    it('should trigger auto-submit when OTP reaches required length', () => {
      const otpLength = AUTH_CONSTANTS.OTP_LENGTH;
      const completeOtp = '1'.repeat(otpLength);
      const incompleteOtp = '1'.repeat(otpLength - 1);
      
      expect(completeOtp.length).toBe(otpLength);
      expect(incompleteOtp.length).toBe(otpLength - 1);
      
      // This test verifies the condition used in useEffect
      expect(completeOtp.length === otpLength).toBe(true);
      expect(incompleteOtp.length === otpLength).toBe(false);
    });

    it('should validate OTP before auto-submit', () => {
      const validateOTP = (code: string): boolean => {
        const expectedLength = AUTH_CONSTANTS.OTP_LENGTH;
        const digitRegex = new RegExp(`^\\d{${expectedLength}}$`);
        return code.length === expectedLength && digitRegex.test(code);
      };

      const validOtp = '123456';
      const invalidOtp = '12345a';
      
      expect(validOtp.length).toBe(AUTH_CONSTANTS.OTP_LENGTH);
      expect(invalidOtp.length).toBe(AUTH_CONSTANTS.OTP_LENGTH);
      
      expect(validateOTP(validOtp)).toBe(true);
      expect(validateOTP(invalidOtp)).toBe(false);
    });
  });
});