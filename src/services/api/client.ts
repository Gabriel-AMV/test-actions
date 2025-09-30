import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import * as Sentry from '@sentry/react-native';
import { ENV } from '@config/env';
import { secureStorage } from '@services/storage/secureStorage';

// Extend Axios config to include metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// Event emitter for auth failures
type AuthFailureListener = () => void;
let authFailureListener: AuthFailureListener | null = null;

export const setAuthFailureListener = (listener: AuthFailureListener) => {
  authFailureListener = listener;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token and Sentry breadcrumbs
    this.client.interceptors.request.use(
      async (config) => {
        const token = await secureStorage.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add Sentry breadcrumb for network request
        Sentry.addBreadcrumb({
          category: 'http',
          type: 'http',
          level: 'info',
          message: `${config.method?.toUpperCase()} ${config.url}`,
          data: {
            url: config.url,
            method: config.method,
          },
        });

        // Start performance tracking
        config.metadata = { startTime: Date.now() };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and performance tracking
    this.client.interceptors.response.use(
      (response) => {
        // Calculate response time for performance monitoring
        const startTime = response.config.metadata?.startTime;
        if (startTime) {
          const duration = Date.now() - startTime;

          // Add Sentry breadcrumb for successful response
          Sentry.addBreadcrumb({
            category: 'http',
            type: 'http',
            level: 'info',
            message: `${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`,
            data: {
              url: response.config.url,
              method: response.config.method,
              status: response.status,
              duration,
            },
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        // Calculate response time even for errors
        const startTime = error.config?.metadata?.startTime;
        const duration = startTime ? Date.now() - startTime : undefined;

        // Add Sentry breadcrumb for failed request
        Sentry.addBreadcrumb({
          category: 'http',
          type: 'http',
          level: 'error',
          message: `${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'FAILED'} (${duration || '?'}ms)`,
          data: {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            duration,
            error: error.message,
          },
        });

        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed && error.config) {
            // Retry the original request
            return this.client.request(error.config);
          } else {
            // Refresh failed, clear auth and trigger navigation to login
            await secureStorage.clearAuth();
            if (authFailureListener) {
              authFailureListener();
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await secureStorage.getRefreshToken();
      if (!refreshToken) return false;

      const response = await axios.post(`${ENV.API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token } = response.data;
      await secureStorage.setAuthToken(access_token);
      await secureStorage.setRefreshToken(refresh_token);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();