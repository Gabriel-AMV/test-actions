import * as SQLite from 'expo-sqlite';
import * as migration_001 from './001_initial_schema';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: migration_001.up,
    down: migration_001.down,
  },
  // Add new migrations here
];