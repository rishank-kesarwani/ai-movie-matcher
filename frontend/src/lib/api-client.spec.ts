import { formatApiError } from './api-client';

describe('api-client formatApiError', () => {
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
  });
});
