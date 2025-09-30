import * as SQLite from 'expo-sqlite';
import * as Sentry from '@sentry/react-native';
import { ENV } from '@config/env';
import { migrations } from './migrations';
import { logger } from '@utils/logger';

let database: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (database) {
    return database;
  }

  try {
    // Open database
    database = await SQLite.openDatabaseAsync(ENV.DATABASE_NAME);

    // Run migrations
    await runMigrations(database);

    return database;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!database) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return database;
};

const runMigrations = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    // Create migrations table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get current version
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM migrations'
    );
    const currentVersion = result?.version || 0;

    // Run pending migrations
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Running migration ${migration.version}: ${migration.name}`);
        await migration.up(db);
        await db.runAsync('INSERT INTO migrations (version, name) VALUES (?, ?)', [
          migration.version,
          migration.name,
        ]);
        console.log(`Migration ${migration.version} completed`);
      }
    }

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export { SQLite };