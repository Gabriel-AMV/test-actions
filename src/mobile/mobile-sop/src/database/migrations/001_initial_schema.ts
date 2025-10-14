import * as SQLite from 'expo-sqlite';

export const up = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Folders table (for file hierarchy)
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      user_id INTEGER NOT NULL,
      last_synced_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Files table
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      folder_id INTEGER NOT NULL,
      size INTEGER,
      mime_type TEXT,
      local_path TEXT,
      remote_url TEXT,
      synced BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
    );

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
    CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
    CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
    CREATE INDEX IF NOT EXISTS idx_files_synced ON files(synced);
  `);
};

export const down = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    DROP INDEX IF EXISTS idx_files_synced;
    DROP INDEX IF EXISTS idx_files_folder_id;
    DROP INDEX IF EXISTS idx_folders_user_id;
    DROP INDEX IF EXISTS idx_folders_parent_id;
    DROP TABLE IF EXISTS files;
    DROP TABLE IF EXISTS folders;
    DROP TABLE IF EXISTS users;
  `);
};