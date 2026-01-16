import { createApiError, ApiError, isUnauthorisedError } from '@/utils/apiError';

type MockError =
  | {
      response?: {
        status?: number | null;
        data?: Record<string, unknown> & { message?: string };
      };
      message?: string;
    }
  | null
  | undefined;

describe('createApiError', () => {
  let mockError: MockError;
  let expectedApiError: ApiError;

  beforeEach(() => {
    mockError = {
      response: {
        status: null,
        data: {},
      },
      message: undefined,
    };

    expectedApiError = {
      name: 'API Error',
      status: null,
      message: 'Unexpected API Error',
      details: undefined,
    };
  });

  it('should create ApiError from Axios response error with message', () => {
    mockError!.response!.status = 404;
    mockError!.response!.data = { message: 'Not Found', extra: 'details here' };

    expectedApiError.status = 404;
    expectedApiError.message = 'Not Found';
    expectedApiError.details = { message: 'Not Found', extra: 'details here' };

    expect(createApiError(mockError)).toEqual(expectedApiError);
  });

  it('should create ApiError from Axios response error without message', () => {
    mockError!.response!.status = 404;
    mockError!.response!.data = { extra: 'details here' };

    expectedApiError.status = 404;
    expectedApiError.message = 'Unexpected API Error';
    expectedApiError.details = { extra: 'details here' };

    expect(createApiError(mockError)).toEqual(expectedApiError);
  });

  it('should create ApiError from error with only message property', () => {
    mockError!.response = undefined;
    mockError!.message = 'Network failure';

    expectedApiError.status = null;
    expectedApiError.message = 'Network failure';
    expectedApiError.details = undefined;

    expect(createApiError(mockError)).toEqual(expectedApiError);
  });

  it('should return default message if error has no message or response', () => {
    mockError!.response = undefined;
    mockError!.message = undefined;

    expectedApiError.status = null;
    expectedApiError.message = 'Unexpected API Error';
    expectedApiError.details = undefined;

    expect(createApiError(mockError)).toEqual(expectedApiError);
  });

  it('should handle null error gracefully', () => {
    expect(createApiError(null)).toEqual(expectedApiError);
  });

  it('should handle undefined error gracefully', () => {
    expect(createApiError(undefined)).toEqual(expectedApiError);
  });

  it('should handle error with response but no message', () => {
    mockError!.response!.status = 500;
    mockError!.response!.data = { code: 'SERVER_ERROR' };

    expectedApiError.status = 500;
    expectedApiError.message = 'Unexpected API Error';
    expectedApiError.details = { code: 'SERVER_ERROR' };

    expect(createApiError(mockError)).toEqual(expectedApiError);
  });
});

describe('isUnauthorisedError', () => {
  it('returns false if passing null as param', () => {
    expect(isUnauthorisedError(null)).toBe(false);
  });

  it('returns false if passing non-object values', () => {
    expect(isUnauthorisedError(undefined)).toBe(false);
    expect(isUnauthorisedError(123)).toBe(false);
    expect(isUnauthorisedError('string')).toBe(false);
    expect(isUnauthorisedError(true)).toBe(false);
  });

  it('returns false if passing object without status', () => {
    const obj = { message: 'oops' };
    expect(isUnauthorisedError(obj)).toBe(false);
  });

  it('returns false if passing object with non-numeric status', () => {
    const obj = { status: '403', message: 'oops' };
    expect(isUnauthorisedError(obj)).toBe(false);
  });

  it('returns true if status 401', () => {
    const error: ApiError = { status: 401, message: 'Unauthorized', name: 'API Error' };
    expect(isUnauthorisedError(error)).toBe(true);
  });

  it('returns true if status 403', () => {
    const error: ApiError = { status: 403, message: 'Forbidden', name: 'API Error' };
    expect(isUnauthorisedError(error)).toBe(true);
  });

  it('returns false for any other status code rather than 401 or 403', () => {
    const error: ApiError = { status: 400, message: 'Bad Request', name: 'API Error' };
    expect(isUnauthorisedError(error)).toBe(false);

    const error2: ApiError = { status: 500, message: 'Server Error', name: 'API Error' };
    expect(isUnauthorisedError(error2)).toBe(false);
  });

  it('works if extra properties exist', () => {
    const error = { status: 403, foo: 'bar', message: 'Forbidden', name: 'API Error' };
    expect(isUnauthorisedError(error)).toBe(true);
  });
});
