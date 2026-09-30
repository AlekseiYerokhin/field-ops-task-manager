// Mock expo-sqlite before importing the module
const mockDb = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
  closeAsync: jest.fn(),
} as any;

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
}));

import * as SQLite from 'expo-sqlite';
import { getDatabase, initializeDatabase, closeDatabase } from './database';

const mockedSQLite = SQLite as jest.Mocked<typeof SQLite>;

describe('database', () => {
  beforeAll(() => {
    mockedSQLite.openDatabaseAsync.mockResolvedValue(mockDb);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedSQLite.openDatabaseAsync.mockResolvedValue(mockDb);
  });

  describe('getDatabase', () => {
    it('should open database with correct name', async () => {
      const db = await getDatabase();

      expect(mockedSQLite.openDatabaseAsync).toHaveBeenCalledWith('field-ops-tasks.db');
      expect(db).toBe(mockDb);
    });
  });

  describe('initializeDatabase', () => {
    it('should create tasks table', async () => {
      await initializeDatabase();

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS tasks')
      );
    });

    it('should create attachments table', async () => {
      await initializeDatabase();

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS attachments')
      );
    });

    it('should create history_logs table', async () => {
      await initializeDatabase();

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS history_logs')
      );
    });

    it('should enable WAL mode', async () => {
      await initializeDatabase();

      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('PRAGMA journal_mode = WAL')
      );
    });
  });

  describe('closeDatabase', () => {
    it('should close database if open', async () => {
      await getDatabase();
      await closeDatabase();

      expect(mockDb.closeAsync).toHaveBeenCalled();
    });

    it('should not throw if database is not open', async () => {
      await expect(closeDatabase()).resolves.not.toThrow();
    });
  });
});
