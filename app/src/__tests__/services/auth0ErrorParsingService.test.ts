import auth0ErrorParsingService, { ErrorWithDetails } from '@/services/auth0ErrorParsingService';

describe('auth0ErrorParsingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseError', () => {
    it('should parse INVALID_CODE error from invalid_grant', () => {
      const error = new Error('Wrong email or verification code.') as ErrorWithDetails;
      error.name = 'invalid_grant';
      error.code = 'invalid_grant';

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('INVALID_CODE');
      expect(result.translationKey).toBe('auth.errors.otpVerificationFailed');
      expect(result.originalError.name).toBe('invalid_grant');
      expect(result.originalError.message).toBe('Wrong email or verification code.');
    });

    it('should parse CODE_EXPIRED error when message contains "expired"', () => {
      const error = new Error('The verification code has expired') as ErrorWithDetails;
      error.name = 'invalid_grant';
      error.code = 'invalid_grant';

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('CODE_EXPIRED');
      expect(result.translationKey).toBe('auth.errors.otpExpired');
    });

    it('should parse EMAIL_NOT_AUTHORIZED error from access_denied', () => {
      const error = new Error('Access denied') as ErrorWithDetails;
      error.name = 'access_denied';
      error.code = 'access_denied';

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('EMAIL_NOT_AUTHORIZED');
      expect(result.translationKey).toBe('auth.errors.emailNotAuthorized');
    });

    it('should parse EMAIL_NOT_AUTHORIZED error from linking account error with status 500', () => {
      const error = new Error('Error linking account') as ErrorWithDetails;
      error.name = 'Error';
      error.status = 500;

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('EMAIL_NOT_AUTHORIZED');
      expect(result.translationKey).toBe('auth.errors.emailNotAuthorized');
    });

    it('should parse TOO_MANY_ATTEMPTS error from too_many_attempts', () => {
      const error = new Error('Too many attempts') as ErrorWithDetails;
      error.name = 'too_many_attempts';
      error.code = 'too_many_attempts';

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('TOO_MANY_ATTEMPTS');
      expect(result.translationKey).toBe('auth.errors.tooManyAttempts');
    });

    it('should parse TOO_MANY_ATTEMPTS error from status 429', () => {
      const error = new Error('Rate limit exceeded') as ErrorWithDetails;
      error.name = 'Error';
      error.status = 429;

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('TOO_MANY_ATTEMPTS');
      expect(result.translationKey).toBe('auth.errors.tooManyAttempts');
    });

    it('should parse USER_BLOCKED error', () => {
      const error = new Error('User is blocked') as ErrorWithDetails;
      error.name = 'blocked_user';
      error.code = 'blocked_user';

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('USER_BLOCKED');
      expect(result.translationKey).toBe('auth.errors.userBlocked');
    });

    it('should parse UNKNOWN_ERROR for unrecognized error', () => {
      const error = new Error('Some random error') as ErrorWithDetails;
      error.name = 'random_error';

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('UNKNOWN_ERROR');
      expect(result.translationKey).toBe('auth.errors.unknownError');
    });

    it('should handle error without name property', () => {
      const error = new Error('An error occurred');

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('UNKNOWN_ERROR');
      expect(result.originalError.name).toBe('unknown_error');
    });

    it('should extract error code when name is Error', () => {
      const error = new Error('Test message') as ErrorWithDetails;
      error.code = 'custom_code';

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.originalError.name).toBe('custom_code');
      expect(result.originalError.code).toBe('custom_code');
    });

    it('should handle error with status property', () => {
      const error = new Error('Server error') as ErrorWithDetails;
      error.name = 'server_error';
      error.status = 500;

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.originalError.status).toBe(500);
    });

    it('should handle invalid_grant with verification code in message', () => {
      const error = new Error('verification code is invalid') as ErrorWithDetails;
      error.name = 'invalid_grant';

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('INVALID_CODE');
    });

    it('should handle invalid_grant with wrong in message', () => {
      const error = new Error('wrong credentials') as ErrorWithDetails;
      error.name = 'invalid_grant';

      const result = auth0ErrorParsingService.parseError(error);

      expect(result.type).toBe('INVALID_CODE');
    });
  });

  describe('getTranslationKeyForError', () => {
    it('should return correct translation key for INVALID_CODE', () => {
      const error = new Error('Wrong code') as ErrorWithDetails;
      error.name = 'invalid_grant';

      const key = auth0ErrorParsingService.getTranslationKeyForError(error);

      expect(key).toBe('auth.errors.otpVerificationFailed');
    });

    it('should return correct translation key for CODE_EXPIRED', () => {
      const error = new Error('Code has expired') as ErrorWithDetails;
      error.name = 'invalid_grant';

      const key = auth0ErrorParsingService.getTranslationKeyForError(error);

      expect(key).toBe('auth.errors.otpExpired');
    });

    it('should return correct translation key for UNKNOWN_ERROR', () => {
      const error = new Error('Random error');

      const key = auth0ErrorParsingService.getTranslationKeyForError(error);

      expect(key).toBe('auth.errors.unknownError');
    });
  });

  describe('isErrorType', () => {
    it('should return true when error matches type INVALID_CODE', () => {
      const error = new Error('Wrong code') as ErrorWithDetails;
      error.name = 'invalid_grant';

      const result = auth0ErrorParsingService.isErrorType(error, 'INVALID_CODE');

      expect(result).toBe(true);
    });

    it('should return false when error does not match type', () => {
      const error = new Error('Wrong code') as ErrorWithDetails;
      error.name = 'invalid_grant';

      const result = auth0ErrorParsingService.isErrorType(error, 'USER_BLOCKED');

      expect(result).toBe(false);
    });

    it('should return true for TOO_MANY_ATTEMPTS', () => {
      const error = new Error('Too many attempts') as ErrorWithDetails;
      error.name = 'too_many_attempts';

      const result = auth0ErrorParsingService.isErrorType(error, 'TOO_MANY_ATTEMPTS');

      expect(result).toBe(true);
    });

    it('should return true for EMAIL_NOT_AUTHORIZED', () => {
      const error = new Error('Access denied') as ErrorWithDetails;
      error.name = 'access_denied';

      const result = auth0ErrorParsingService.isErrorType(error, 'EMAIL_NOT_AUTHORIZED');

      expect(result).toBe(true);
    });
  });
});
