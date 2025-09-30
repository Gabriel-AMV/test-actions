export interface File {
  id: number;
  name: string;
  folder_id: number;
  size: number | null;
  mime_type: string | null;
  local_path: string | null;
  remote_url: string | null;
  synced: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFileInput {
  name: string;
  folder_id: number;
  size?: number;
  mime_type?: string;
  local_path?: string;
  remote_url?: string;
  synced?: boolean;
}

export interface UpdateFileInput {
  name?: string;
  folder_id?: number;
  size?: number;
  mime_type?: string;
  local_path?: string;
  remote_url?: string;
  synced?: boolean;
}