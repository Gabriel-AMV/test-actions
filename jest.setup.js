/* eslint-env jest */
// Jest setup file
import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(() => Promise.resolve()),
      runAsync: jest.fn(() => Promise.resolve()),
      getFirstAsync: jest.fn(() => Promise.resolve(null)),
      getAllAsync: jest.fn(() => Promise.resolve([])),
    })
  ),
}));

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
}));

// Mock global expo registry and winter runtime
global.__ExpoImportMetaRegistry = {
  register: jest.fn(),
  get: jest.fn(() => ({})),
};

global.structuredClone = global.structuredClone || ((obj) => JSON.parse(JSON.stringify(obj)));

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Set timeout for tests
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllTimers();
});
