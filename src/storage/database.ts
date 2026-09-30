import * as SQLite from 'expo-sqlite';

const DB_NAME = 'field-ops-tasks.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();
  
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      locationAddress TEXT NOT NULL,
      locationLatitude REAL,
      locationLongitude REAL,
      status TEXT NOT NULL DEFAULT 'New',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL DEFAULT 'pending'
    );
    
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY NOT NULL,
      taskId TEXT NOT NULL,
      uri TEXT NOT NULL,
      fileName TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS history_logs (
      id TEXT PRIMARY KEY NOT NULL,
      taskId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      actionType TEXT NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_attachments_taskId ON attachments(taskId);
    CREATE INDEX IF NOT EXISTS idx_history_logs_taskId ON history_logs(taskId);
    CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
