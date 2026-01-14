import { validateOTP, validateEmail } from '@/utils/validation';

describe('Validation Utils', () => {
  describe('validateOTP', () => {
    it('should validate correct OTP codes with default length', () => {
      const validCodes = ['123456', '000000', '999999', '654321', '111111'];

      validCodes.forEach((code) => {
        expect(validateOTP(code)).toBe(true);
      });
    });

    it('should reject invalid OTP codes with default length', () => {
      const invalidCodes = [
        '', // Empty string
        '12345', // Too short
        '1234567', // Too long
        'abcdef', // Letters
        '12a456', // Mixed alphanumeric
        '12 456', // Contains space
        '12-456', // Contains dash
        '12.456', // Contains dot
        '€12345', // Special characters
        '12345€', // Special characters at end
      ];

      invalidCodes.forEach((code) => {
        expect(validateOTP(code)).toBe(false);
      });
    });

    it('should validate OTP codes with custom length', () => {
      // 4-digit codes
      expect(validateOTP('1234', 4)).toBe(true);

      // Should reject wrong length for 4-digit
      expect(validateOTP('123', 4)).toBe(false);
      expect(validateOTP('12345', 4)).toBe(false);

      // 8-digit codes
      expect(validateOTP('12345678', 8)).toBe(true);

      // Should reject wrong length for 8-digit
      expect(validateOTP('1234567', 8)).toBe(false);
      expect(validateOTP('123456789', 8)).toBe(false);
    });
  });

  it('should handle whitespace correctly', () => {
    expect(validateOTP(' 123456')).toBe(false);
    expect(validateOTP('123456 ')).toBe(false);
    expect(validateOTP(' 123456 ')).toBe(false);
    expect(validateOTP('123 456')).toBe(false);
    expect(validateOTP('12\n3456')).toBe(false);
    expect(validateOTP('123\t456')).toBe(false);
  });

  it('should handle numeric strings with leading zeros', () => {
    expect(validateOTP('000001')).toBe(true);
    expect(validateOTP('001234')).toBe(true);
    expect(validateOTP('100000')).toBe(true);
  });
});

describe('validateEmail', () => {
  it('should validate correct email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'firstname.lastname@company.org',
      'user+tag@domain.com',
      'a@b.co',
      'very.long.email.address@very.long.domain.name.com',
      'user123@domain123.com',
      'test_user@test-domain.com',
      'user@subdomain.example.org',
    ];

    validEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(true);
    });
  });

  it('should reject invalid email formats', () => {
    expect(validateEmail('')).toBe(false); // Empty string
    expect(validateEmail('invalid-email')).toBe(false); // No @ symbol
    expect(validateEmail('@example.com')).toBe(false); // No local part
    expect(validateEmail('user@')).toBe(false); // No domain
    expect(validateEmail('user@domain')).toBe(false); // No TLD
    expect(validateEmail('user name@domain.com')).toBe(false); // Space in local part
    expect(validateEmail('user@domain .com')).toBe(false); // Space in domain
    expect(validateEmail('user@@domain.com')).toBe(false); // Double @
    expect(validateEmail('user@domain@com')).toBe(false); // Multiple @
  });

  it('should handle emails with whitespace correctly', () => {
    // Should trim whitespace and validate
    expect(validateEmail(' test@example.com')).toBe(true);
    expect(validateEmail('test@example.com ')).toBe(true);
    expect(validateEmail(' test@example.com ')).toBe(true);

    // Should reject emails with internal whitespace
    expect(validateEmail('te st@example.com')).toBe(false);
    expect(validateEmail('test@exa mple.com')).toBe(false);
    expect(validateEmail('test @example.com')).toBe(false);
    expect(validateEmail('test@ example.com')).toBe(false);
  });

  it('should handle edge cases', () => {
    // Minimal valid email
    expect(validateEmail('a@b.c')).toBe(true);

    // Long but valid emails
    expect(validateEmail('verylongusername@verylongdomainname.verylongtld')).toBe(true);

    // Valid but unusual formats
    expect(validateEmail('user.@domain.com')).toBe(true);
    expect(validateEmail('user+tag+more@domain.co')).toBe(true);
  });

  it('should be case insensitive by nature of regex', () => {
    expect(validateEmail('TEST@EXAMPLE.COM')).toBe(true);
    expect(validateEmail('Test@Example.Com')).toBe(true);
  });
});
