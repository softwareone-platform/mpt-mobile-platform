import { REVIEWER_EMAILS, REVIEW_ENVIRONMENT, isReviewerEmail } from '@/config/reviewers.config';

describe('reviewers.config', () => {
  describe('email parsing logic', () => {
    it('should parse comma-separated emails correctly', () => {
      const testEmails = 'apple@apple.com,google@google.com,microsoft@microsoft.com';
      const expected = ['apple@apple.com', 'google@google.com', 'microsoft@microsoft.com'];

      const result = testEmails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      expect(result).toEqual(expected);
    });

    it('should trim whitespace from emails', () => {
      const testEmails = '  apple@apple.com  ,  google@google.com  ';
      const expected = ['apple@apple.com', 'google@google.com'];

      const result = testEmails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      expect(result).toEqual(expected);
    });

    it('should filter out empty strings', () => {
      const testEmails = 'apple@apple.com,,google@google.com,  ,';
      const expected = ['apple@apple.com', 'google@google.com'];

      const result = testEmails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      expect(result).toEqual(expected);
    });

    it('should handle single email without comma', () => {
      const testEmails = 'apple@apple.com';
      const expected = ['apple@apple.com'];

      const result = testEmails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      expect(result).toEqual(expected);
    });
  });

  describe('REVIEWER_EMAILS', () => {
    it('should be an array', () => {
      expect(Array.isArray(REVIEWER_EMAILS)).toBe(true);
    });

    it('should contain properly formatted emails', () => {
      if (REVIEWER_EMAILS.length > 0) {
        REVIEWER_EMAILS.forEach((email) => {
          expect(email).toMatch(/@/);
          expect(email.trim()).toBe(email);
        });
      }
    });
  });

  describe('isReviewerEmail', () => {
    it('should return true for configured reviewer emails', () => {
      if (REVIEWER_EMAILS.length > 0) {
        expect(isReviewerEmail(REVIEWER_EMAILS[0])).toBe(true);
      }
    });

    it('should return false for non-reviewer email', () => {
      expect(isReviewerEmail('definitely.not.a.reviewer@example.com')).toBe(false);
    });

    it('should be case-insensitive', () => {
      if (REVIEWER_EMAILS.length > 0) {
        const email = REVIEWER_EMAILS[0];
        expect(isReviewerEmail(email.toUpperCase())).toBe(true);
        expect(isReviewerEmail(email.toLowerCase())).toBe(true);
      }
    });

    it('should trim whitespace from input', () => {
      if (REVIEWER_EMAILS.length > 0) {
        const email = REVIEWER_EMAILS[0];
        expect(isReviewerEmail(`  ${email}  `)).toBe(true);
      }
    });

    it('should return false for empty string', () => {
      expect(isReviewerEmail('')).toBe(false);
    });

    it('should not match partial emails', () => {
      expect(isReviewerEmail('part')).toBe(false);
      expect(isReviewerEmail('notfound@')).toBe(false);
    });
  });

  describe('REVIEW_ENVIRONMENT', () => {
    it('should have all required Auth0 properties', () => {
      expect(REVIEW_ENVIRONMENT).toHaveProperty('AUTH0_DOMAIN');
      expect(REVIEW_ENVIRONMENT).toHaveProperty('AUTH0_CLIENT_ID');
      expect(REVIEW_ENVIRONMENT).toHaveProperty('AUTH0_AUDIENCE');
      expect(REVIEW_ENVIRONMENT).toHaveProperty('AUTH0_API_URL');
    });

    it('should have non-empty string values', () => {
      expect(typeof REVIEW_ENVIRONMENT.AUTH0_DOMAIN).toBe('string');
      expect(typeof REVIEW_ENVIRONMENT.AUTH0_CLIENT_ID).toBe('string');
      expect(typeof REVIEW_ENVIRONMENT.AUTH0_AUDIENCE).toBe('string');
      expect(typeof REVIEW_ENVIRONMENT.AUTH0_API_URL).toBe('string');

      expect(REVIEW_ENVIRONMENT.AUTH0_DOMAIN.length).toBeGreaterThan(0);
      expect(REVIEW_ENVIRONMENT.AUTH0_CLIENT_ID.length).toBeGreaterThan(0);
      expect(REVIEW_ENVIRONMENT.AUTH0_AUDIENCE.length).toBeGreaterThan(0);
      expect(REVIEW_ENVIRONMENT.AUTH0_API_URL.length).toBeGreaterThan(0);
    });
  });
});
