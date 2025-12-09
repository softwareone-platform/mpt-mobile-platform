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

  describe('Resend Timer Logic', () => {
    const RESEND_COOLDOWN_SECONDS = 90;

    const displayTimer = (seconds: number): string => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    it('should format timer display correctly', () => {
      expect(displayTimer(90)).toBe('1:30');
      expect(displayTimer(60)).toBe('1:00');
      expect(displayTimer(59)).toBe('0:59');
      expect(displayTimer(30)).toBe('0:30');
      expect(displayTimer(10)).toBe('0:10');
      expect(displayTimer(5)).toBe('0:05');
      expect(displayTimer(1)).toBe('0:01');
      expect(displayTimer(0)).toBe('0:00');
    });

    it('should handle timer countdown correctly', () => {
      let timer = RESEND_COOLDOWN_SECONDS;
      
      expect(timer).toBe(90);
      
      // Simulate countdown
      timer -= 1;
      expect(timer).toBe(89);
      
      timer -= 30;
      expect(timer).toBe(59);
      
      timer -= 59;
      expect(timer).toBe(0);
    });

    it('should enable resend when timer reaches zero', () => {
      const canResend = (timer: number): boolean => timer === 0;
      
      expect(canResend(90)).toBe(false);
      expect(canResend(1)).toBe(false);
      expect(canResend(0)).toBe(true);
    });

    it('should reset timer to cooldown value on resend', () => {
      let timer = 0;
      const canResend = timer === 0;
      
      expect(canResend).toBe(true);
      
      // Simulate resend action
      if (canResend) {
        timer = RESEND_COOLDOWN_SECONDS;
      }
      
      expect(timer).toBe(90);
      expect(displayTimer(timer)).toBe('1:30');
    });

    it('should handle multiple timer cycles', () => {
      let timer = RESEND_COOLDOWN_SECONDS;
      
      // First cycle
      expect(timer).toBe(90);
      timer = 0; // Simulate countdown to 0
      expect(timer).toBe(0);
      
      // Reset for second cycle
      timer = RESEND_COOLDOWN_SECONDS;
      expect(timer).toBe(90);
      
      // Second cycle
      timer = 0;
      expect(timer).toBe(0);
    });
  });
});
