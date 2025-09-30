import { renderHook, waitFor, cleanup } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFolderContents } from '@hooks/useFolders';
import { mockApiEndpoints } from '@services/api/endpoints/folders';
import * as NetworkUtils from '@utils/network';
import * as FolderRepo from '@repositories/folderRepository';

// Mock dependencies
jest.mock('@services/api/endpoints/folders');
jest.mock('@utils/network');
jest.mock('@repositories/folderRepository');
jest.mock('@utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('useFolderContents', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Cleanup React Testing Library
    cleanup();

    // Clear all queries and cancel any pending queries
    await queryClient.cancelQueries();
    queryClient.clear();
    queryClient.unmount();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Online Mode', () => {
    beforeEach(() => {
      // Mock online network state
      (NetworkUtils.isOnline as jest.Mock).mockResolvedValue(true);
    });

    it('should fetch and save folder contents from API when online', async () => {
      const mockApiData = {
        folders: [
          { id: 1, name: 'Folder 1', parent_id: null, user_id: 1 },
          { id: 2, name: 'Folder 2', parent_id: null, user_id: 1 },
        ],
        files: [
          {
            id: 1,
            name: 'File 1.txt',
            folder_id: 0,
            size: 1024,
            mime_type: 'text/plain',
            remote_url: 'https://example.com/file1.txt',
          },
        ],
      };

      (mockApiEndpoints.fetchFolderContents as jest.Mock).mockResolvedValue(mockApiData);
      (FolderRepo.getFolderContents as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Folder 1', type: 'folder' },
        { id: 2, name: 'Folder 2', type: 'folder' },
        { id: 1, name: 'File 1.txt', type: 'file', size: 1024, mime_type: 'text/plain' },
      ]);

      const { result } = renderHook(() => useFolderContents(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiEndpoints.fetchFolderContents).toHaveBeenCalledWith(undefined);
      expect(FolderRepo.saveFolders).toHaveBeenCalledWith(mockApiData.folders);
      expect(FolderRepo.saveFiles).toHaveBeenCalledWith(mockApiData.files);
      expect(result.current.data).toHaveLength(3); // 2 folders + 1 file
    });

    it('should mark empty folders as synced', async () => {
      const mockApiData = {
        folders: [],
        files: [],
      };

      (mockApiEndpoints.fetchFolderContents as jest.Mock).mockResolvedValue(mockApiData);
      (FolderRepo.getFolderContents as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useFolderContents(1), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verify that the folder was marked as synced
      expect(FolderRepo.markFolderAsSynced).toHaveBeenCalledWith(1);
      expect(result.current.data).toEqual([]);
    });

    it('should fallback to local DB when API fails', async () => {
      (mockApiEndpoints.fetchFolderContents as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );
      (FolderRepo.getFolderContents as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Cached Folder', type: 'folder' },
      ]);

      const { result } = renderHook(() => useFolderContents(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([{ id: 1, name: 'Cached Folder', type: 'folder' }]);
    });
  });

  describe('Offline Mode', () => {
    beforeEach(() => {
      // Mock offline network state
      (NetworkUtils.isOnline as jest.Mock).mockResolvedValue(false);
    });

    it('should return cached data when offline and folder was synced', async () => {
      // Mock folder that was previously synced
      (FolderRepo.isFolderSynced as jest.Mock).mockResolvedValue(true);
      (FolderRepo.getFolderContents as jest.Mock).mockResolvedValue([
        { id: 2, name: 'Subfolder', type: 'folder' },
      ]);

      const { result } = renderHook(() => useFolderContents(1), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([{ id: 2, name: 'Subfolder', type: 'folder' }]);
      expect(mockApiEndpoints.fetchFolderContents).not.toHaveBeenCalled();
    });

    it('should return empty array for synced empty folder when offline', async () => {
      // Mock empty folder that was previously synced
      (FolderRepo.isFolderSynced as jest.Mock).mockResolvedValue(true);
      (FolderRepo.getFolderContents as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useFolderContents(1), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('should throw error when offline and folder was never synced', async () => {
      // Mock folder that was never synced
      (FolderRepo.isFolderSynced as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useFolderContents(1), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
      expect((result.current.error as Error).message).toContain(
        'No internet connection and folder has not been synced'
      );
    });

    it('should throw error when offline and folder does not exist', async () => {
      // Mock folder not found
      (FolderRepo.isFolderSynced as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useFolderContents(999), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});