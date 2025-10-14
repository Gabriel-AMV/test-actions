import * as Network from 'expo-network';
import { logger } from '@utils/logger';

/**
 * Check if device has network connectivity
 * @returns true if device is connected to internet, false otherwise
 */
export async function isOnline(): Promise<boolean> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected && networkState.isInternetReachable;

    logger.info('Network state check', {
      isConnected: networkState.isConnected,
      isInternetReachable: networkState.isInternetReachable,
      type: networkState.type,
    });

    return isConnected ?? false;
  } catch (error) {
    logger.error('Failed to check network state', error);
    return false;
  }
}
