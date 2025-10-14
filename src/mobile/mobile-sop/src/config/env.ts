export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
  API_TIMEOUT: 30000,
  DATABASE_NAME: 'app_database.db',
  DATABASE_VERSION: 1,
  ENABLE_LOGGING: __DEV__,
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
  },
} as const;

export type Environment = typeof ENV;