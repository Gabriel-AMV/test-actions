import * as SecureStore from 'expo-secure-store';
import { ENV } from '@config/env';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      // Remove all known keys
      for (const key of Object.values(ENV.STORAGE_KEYS)) {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw error;
    }
  },

  // Auth-specific helpers
  async setAuthToken(token: string): Promise<void> {
    await this.setItem(ENV.STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getAuthToken(): Promise<string | null> {
    return this.getItem(ENV.STORAGE_KEYS.AUTH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await this.setItem(ENV.STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return this.getItem(ENV.STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setUserId(userId: string): Promise<void> {
    await this.setItem(ENV.STORAGE_KEYS.USER_ID, userId);
  },

  async getUserId(): Promise<string | null> {
    return this.getItem(ENV.STORAGE_KEYS.USER_ID);
  },

  async clearAuth(): Promise<void> {
    await Promise.all([
      this.removeItem(ENV.STORAGE_KEYS.AUTH_TOKEN),
      this.removeItem(ENV.STORAGE_KEYS.REFRESH_TOKEN),
      this.removeItem(ENV.STORAGE_KEYS.USER_ID),
    ]);
  },
};