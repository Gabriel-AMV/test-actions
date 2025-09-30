import { useQuery } from '@tanstack/react-query';
import { logger } from '@utils/logger';
import { mockApiEndpoints } from '@services/api/endpoints/folders';
import { isOnline } from '@utils/network';
import * as FolderRepo from '@repositories/folderRepository';
import type { FolderItem } from '@repositories/folderRepository';

// Query key factory
export const folderKeys = {
  all: ['folders'] as const,
  lists: () => [...folderKeys.all, 'list'] as const,
  list: (parentId?: number) => [...folderKeys.lists(), { parentId }] as const,
  details: () => [...folderKeys.all, 'detail'] as const,
  detail: (id: number) => [...folderKeys.details(), id] as const,
  contents: (folderId?: number) => [...folderKeys.all, 'contents', { folderId }] as const,
};

// Re-export FolderItem type for backwards compatibility
export type { FolderItem };

// Load folder contents when offline
async function loadOfflineFolderContents(folderId?: number): Promise<FolderItem[]> {
  logger.info('No network connectivity, loading from local DB', { folderId });

  // Check if this folder has been synced before
  if (folderId !== undefined) {
    const synced = await FolderRepo.isFolderSynced(folderId);
    if (!synced) {
      logger.warn('Folder has never been synced and device is offline', { folderId });
      throw new Error('No internet connection and folder has not been synced');
    }
  }

  const localData = await FolderRepo.getFolderContents(folderId);
  logger.info('Returning cached folder contents', { itemCount: localData.length });
  return localData;
}

// Fetch from API and save to local DB
async function fetchFromApiAndSave(folderId?: number): Promise<FolderItem[]> {
  const apiData = await mockApiEndpoints.fetchFolderContents(folderId);

  // Validate API response
  if (!apiData || (!Array.isArray(apiData.folders) && !Array.isArray(apiData.files))) {
    throw new Error('Invalid API response format');
  }

  // Save API response to local DB
  logger.info('Saving API data to local database', {
    foldersCount: apiData.folders?.length || 0,
    filesCount: apiData.files?.length || 0,
  });

  if (apiData.folders && apiData.folders.length > 0) {
    await FolderRepo.saveFolders(apiData.folders);
  }

  if (apiData.files && apiData.files.length > 0) {
    await FolderRepo.saveFiles(apiData.files);
  }

  // Mark the parent folder as synced (even if it's empty)
  if (folderId !== undefined) {
    await FolderRepo.markFolderAsSynced(folderId);
  }

  // Always return data from DB to ensure consistency
  logger.info('API data saved, now loading from local DB');
  const dbData = await FolderRepo.getFolderContents(folderId);

  logger.info('Folder contents fetched and saved successfully', {
    itemCount: dbData.length,
  });

  return dbData;
}

// Load folder contents when online (with fallback to local DB on API error)
async function loadOnlineFolderContents(folderId?: number): Promise<FolderItem[]> {
  logger.info('Network available, fetching from API', { folderId });

  try {
    return await fetchFromApiAndSave(folderId);
  } catch (apiError) {
    // API call failed but we're online - log the error type
    logger.error('API call failed', {
      error: apiError,
      errorMessage: apiError instanceof Error ? apiError.message : 'Unknown error',
      folderId,
    });

    // Fallback to local database
    logger.info('Falling back to local database after API error');
    const localData = await FolderRepo.getFolderContents(folderId);

    if (localData.length === 0) {
      // No local data available and API failed
      throw new Error(
        `Failed to load folder contents: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`
      );
    }

    logger.warn('Returning stale data from local DB after API error', {
      itemCount: localData.length,
    });

    return localData;
  }
}

// Fetch folder contents with network-aware strategy
// NOTE: This is NOT the background sync - that will be implemented separately
async function fetchAndSaveFolderContents(folderId?: number): Promise<FolderItem[]> {
  try {
    // Check network connectivity first
    const online = await isOnline();

    if (!online) {
      return await loadOfflineFolderContents(folderId);
    }

    return await loadOnlineFolderContents(folderId);
  } catch (error) {
    // Catch-all error handler
    logger.error('Critical error in fetchAndSaveFolderContents', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      folderId,
    });

    // Last resort: try to load from local DB
    try {
      const localData = await FolderRepo.getFolderContents(folderId);
      if (localData.length > 0) {
        logger.info('Returning cached data after critical error', {
          itemCount: localData.length,
        });
        return localData;
      }
    } catch (dbError) {
      logger.error('Failed to load from local DB as final fallback', {
        error: dbError,
        errorMessage: dbError instanceof Error ? dbError.message : 'Unknown error',
      });
    }

    // If everything fails, throw a user-friendly error
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Unable to load folder contents. Please check your connection and try again.'
    );
  }
}

// Hook to fetch folder contents (folders + files combined)
// Fetches from API and saves to local DB, with fallback to local DB on error
export function useFolderContents(folderId?: number) {
  return useQuery({
    queryKey: folderKeys.contents(folderId),
    queryFn: () => fetchAndSaveFolderContents(folderId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Hook to fetch folders only (legacy, kept for compatibility)
export function useFolders(parentId?: number) {
  return useQuery({
    queryKey: folderKeys.list(parentId),
    queryFn: () => FolderRepo.getFoldersByParent(parentId),
  });
}