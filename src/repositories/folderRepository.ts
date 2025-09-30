import { getDatabase } from '@database/index';
import { Folder } from '@database/models';
import { File } from '@database/models/File';
import { logger } from '@utils/logger';

export interface FolderItem {
  id: number;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  mime_type?: string;
}

/**
 * Save folders from API response to local database
 */
export async function saveFolders(
  folders: Array<{ id: number; name: string; parent_id: number | null; user_id: number }>
): Promise<void> {
  const db = getDatabase();

  for (const folder of folders) {
    const existing = await db.getFirstAsync<Folder>('SELECT * FROM folders WHERE id = ?', [
      folder.id,
    ]);

    if (existing) {
      await db.runAsync(
        'UPDATE folders SET name = ?, parent_id = ?, last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [folder.name, folder.parent_id, folder.id]
      );
    } else {
      await db.runAsync(
        'INSERT INTO folders (id, name, parent_id, user_id, last_synced_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [folder.id, folder.name, folder.parent_id, folder.user_id]
      );
    }
  }
}

/**
 * Save files from API response to local database
 */
export async function saveFiles(
  files: Array<{
    id: number;
    name: string;
    folder_id: number;
    size: number | null;
    mime_type: string | null;
    remote_url: string | null;
  }>
): Promise<void> {
  const db = getDatabase();

  for (const file of files) {
    const existing = await db.getFirstAsync<File>('SELECT * FROM files WHERE id = ?', [file.id]);

    if (existing) {
      await db.runAsync(
        'UPDATE files SET name = ?, size = ?, mime_type = ?, remote_url = ?, synced = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [file.name, file.size, file.mime_type, file.remote_url, file.id]
      );
    } else {
      await db.runAsync(
        'INSERT INTO files (id, name, folder_id, size, mime_type, remote_url, synced) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [file.id, file.name, file.folder_id, file.size, file.mime_type, file.remote_url]
      );
    }
  }
}

/**
 * Load folder contents (folders + files) from local database
 */
export async function getFolderContents(folderId?: number): Promise<FolderItem[]> {
  const db = getDatabase();

  const folders = await db.getAllAsync<Folder>(
    folderId
      ? 'SELECT * FROM folders WHERE parent_id = ? ORDER BY name ASC'
      : 'SELECT * FROM folders WHERE parent_id IS NULL ORDER BY name ASC',
    folderId ? [folderId] : []
  );

  const files = await db.getAllAsync<File>(
    folderId
      ? 'SELECT * FROM files WHERE folder_id = ? ORDER BY name ASC'
      : 'SELECT * FROM files WHERE folder_id = 0 ORDER BY name ASC',
    folderId ? [folderId] : []
  );

  const items: FolderItem[] = [
    ...(folders || []).map((f) => ({
      id: f.id,
      name: f.name,
      type: 'folder' as const,
    })),
    ...(files || []).map((f) => ({
      id: f.id,
      name: f.name,
      type: 'file' as const,
      size: f.size || undefined,
      mime_type: f.mime_type || undefined,
    })),
  ];

  return items;
}

/**
 * Check if folder has been synced before
 */
export async function isFolderSynced(folderId: number): Promise<boolean> {
  const db = getDatabase();
  const folder = await db.getFirstAsync<Folder>('SELECT * FROM folders WHERE id = ?', [folderId]);
  return folder !== null && folder.last_synced_at !== null;
}

/**
 * Mark folder as synced with current timestamp
 */
export async function markFolderAsSynced(folderId: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('UPDATE folders SET last_synced_at = CURRENT_TIMESTAMP WHERE id = ?', [
    folderId,
  ]);
}

/**
 * Get folders by parent ID (legacy function for compatibility)
 */
export async function getFoldersByParent(parentId?: number): Promise<Folder[]> {
  const db = getDatabase();
  const query = parentId
    ? 'SELECT * FROM folders WHERE parent_id = ? ORDER BY name ASC'
    : 'SELECT * FROM folders WHERE parent_id IS NULL ORDER BY name ASC';

  const params = parentId ? [parentId] : [];
  const folders = await db.getAllAsync<Folder>(query, params);

  return folders || [];
}