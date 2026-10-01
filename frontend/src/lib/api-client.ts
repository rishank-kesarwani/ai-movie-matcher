import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT Access Token conditionally
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.trim() !== '' && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (config.headers && config.headers.Authorization) {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor with token refresh & Login Required event dispatch
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap standard ApiResponse wrapper if present
    if (response.data && response.data.success && 'data' in response.data) {
      return response.data;
    }
    return response.data;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If request was canceled
    if (axios.isCancel(error)) {
      return Promise.reject(new Error('Request was canceled'));
    }

    // Handle Network / Timeout Error
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(
        new Error('Request timed out. Please check your network connection and retry.'),
      );
    }

    if (!error.response) {
      return Promise.reject(
        new Error('Network connection error. Server may be temporarily unreachable.'),
      );
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized with token refresh rotation
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      // If no valid refresh token
      if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.dispatchEvent(
            new CustomEvent('auth:login-required', {
              detail: {
                message:
                  data?.message ||
                  'You need to log in to use personalized recommendations, watchlists and AI features.',
              },
            }),
          );
        }
        return Promise.reject(formatApiError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newTokens = refreshResponse.data.data || refreshResponse.data;
        const newAccessToken = newTokens.accessToken;
        const newRefreshToken = newTokens.refreshToken;

        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }
        }

        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.dispatchEvent(
            new CustomEvent('auth:login-required', {
              detail: {
                message:
                  'Your session has expired. Please log in to continue.',
              },
            }),
          );
        }
        return Promise.reject(formatApiError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formatApiError(error));
  },
);

export function formatApiError(error: AxiosError<ApiError>): Error {
  const status = error.response?.status;
  if (error.response?.data?.message) {
    const msg = error.response.data.message;
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    (err as any).statusCode = status;
    (err as any).status = status;
    (err as any).code = error.response.data.code;
    (err as any).response = error.response;
    return err;
  }
  if (status === 429) {
    const err = new Error('Rate limit exceeded. Please wait a moment before trying again.');
    (err as any).statusCode = 429;
    (err as any).status = 429;
    (err as any).response = error.response;
    return err;
  }
  if (status === 403) {
    const err = new Error('You do not have permission to perform this action.');
    (err as any).statusCode = 403;
    (err as any).status = 403;
    (err as any).response = error.response;
    return err;
  }
  if (status === 404) {
    const err = new Error('The requested movie or resource was not found.');
    (err as any).statusCode = 404;
    (err as any).status = 404;
    (err as any).response = error.response;
    return err;
  }
  if (status && status >= 500) {
    const err = new Error('Server or movie provider error. Please try again in a few moments.');
    (err as any).statusCode = status;
    (err as any).status = status;
    (err as any).response = error.response;
    return err;
  }
  (error as any).statusCode = status;
  (error as any).status = status;
  return error;
}
