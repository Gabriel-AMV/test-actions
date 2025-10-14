export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  user_id: number;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderInput {
  name: string;
  parent_id?: number | null;
  user_id: number;
}

export interface UpdateFolderInput {
  name?: string;
  parent_id?: number | null;
}