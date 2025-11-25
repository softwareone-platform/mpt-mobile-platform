import { createApiError, ApiError } from '@/utils/apiError';

describe('createApiError', () => {
  let mockError: any;
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
    mockError.response.status = 404;
    mockError.response.data = { message: 'Not Found', extra: 'details here' };

    expectedApiError.status = 404;
    expectedApiError.message = 'Not Found';
    expectedApiError.details = { message: 'Not Found', extra: 'details here' };

    expect(createApiError(mockError)).toEqual(expectedApiError);
  });

  it('should create ApiError from Axios response error without message', () => {
    mockError.response.status = 404;
    mockError.response.data = { extra: 'details here' };

    expectedApiError.status = 404;
    expectedApiError.message = 'Unexpected API Error';
    expectedApiError.details = { extra: 'details here' };

    expect(createApiError(mockError)).toEqual(expectedApiError);
  });

  it('should create ApiError from error with only message property', () => {
    mockError.response = undefined;
    mockError.message = 'Network failure';

    expectedApiError.status = null;
    expectedApiError.message = 'Network failure';
    expectedApiError.details = undefined;

    expect(createApiError(mockError)).toEqual(expectedApiError);
  });

  it('should return default message if error has no message or response', () => {
    mockError.response = undefined;
    mockError.message = undefined;

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
    mockError.response.status = 500;
    mockError.response.data = { code: 'SERVER_ERROR' };

    expectedApiError.status = 500;
    expectedApiError.message = 'Unexpected API Error';
    expectedApiError.details = { code: 'SERVER_ERROR' };

    expect(createApiError(mockError)).toEqual(expectedApiError);
  });
});
