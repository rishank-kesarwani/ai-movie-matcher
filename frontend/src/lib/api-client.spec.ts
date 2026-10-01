import { formatApiError, apiClient } from './api-client';

describe('api-client formatApiError & Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should format message from server error response correctly', () => {
    const mockAxiosError: any = {
      response: {
        status: 401,
        data: {
          success: false,
          statusCode: 401,
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Please log in to continue.',
        },
      },
    };

    const formatted = formatApiError(mockAxiosError);
    expect(formatted.message).toBe('Please log in to continue.');
    expect((formatted as any).statusCode).toBe(401);
    expect((formatted as any).status).toBe(401);
  });

  it('should format 429 rate limit error gracefully', () => {
    const mockRateLimitError: any = {
      response: {
        status: 429,
        data: {},
      },
    };

    const formatted = formatApiError(mockRateLimitError);
    expect(formatted.message).toContain('Rate limit exceeded');
    expect((formatted as any).statusCode).toBe(429);
  });

  it('should format 403 permission error gracefully', () => {
    const mockForbiddenError: any = {
      response: {
        status: 403,
        data: {},
      },
    };

    const formatted = formatApiError(mockForbiddenError);
    expect(formatted.message).toContain('You do not have permission');
    expect((formatted as any).statusCode).toBe(403);
  });

  it('should format 404 not found error gracefully', () => {
    const mockNotFoundError: any = {
      response: {
        status: 404,
        data: {},
      },
    };

    const formatted = formatApiError(mockNotFoundError);
    expect(formatted.message).toContain('not found');
    expect((formatted as any).statusCode).toBe(404);
  });
});
