import { apiClient } from '../client';

export interface ApiFolderResponse {
  id: number;
  name: string;
  parent_id: number | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ApiFileResponse {
  id: number;
  name: string;
  folder_id: number;
  size: number | null;
  mime_type: string | null;
  remote_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FolderContentsResponse {
  folders: ApiFolderResponse[];
  files: ApiFileResponse[];
}

/**
 * Fetch folder contents (subfolders and files) from real API
 */
export async function fetchFolderContentsFromApi(
  folderId?: number
): Promise<FolderContentsResponse> {
  const endpoint = folderId ? `/folders/${folderId}/contents` : '/folders/root/contents';
  const response = await apiClient.get<FolderContentsResponse>(endpoint);
  return response.data;
}

/**
 * Mock API implementation for development
 */
export const mockApiEndpoints = {
  async fetchFolderContents(folderId?: number): Promise<FolderContentsResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data that simulates API response
    if (!folderId) {
      // Root level folders
      return {
        folders: [
          {
            id: 1,
            name: 'Documents',
            parent_id: null,
            user_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Pictures',
            parent_id: null,
            user_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 3,
            name: 'Projects',
            parent_id: null,
            user_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        files: [
          {
            id: 1,
            name: 'Welcome.txt',
            folder_id: 0,
            size: 1024,
            mime_type: 'text/plain',
            remote_url: 'https://api.example.com/files/1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
    } else if (folderId === 1) {
      // Documents folder
      return {
        folders: [
          {
            id: 4,
            name: 'Work',
            parent_id: 1,
            user_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 5,
            name: 'Personal',
            parent_id: 1,
            user_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        files: [
          {
            id: 2,
            name: 'Resume.pdf',
            folder_id: 1,
            size: 524288,
            mime_type: 'application/pdf',
            remote_url: 'https://api.example.com/files/2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 3,
            name: 'CoverLetter.docx',
            folder_id: 1,
            size: 102400,
            mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            remote_url: 'https://api.example.com/files/3',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
    } else {
      // Empty folder
      return {
        folders: [],
        files: [],
      };
    }
  },
};
