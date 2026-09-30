import * as historyRepository from './historyRepository';
import { getDatabase } from './database';

// Mock the database module
jest.mock('./database');

const mockedGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

describe('historyRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      runAsync: jest.fn(),
      getAllAsync: jest.fn(),
    };

    mockedGetDatabase.mockResolvedValue(mockDb);
  });

  describe('addLogEntry', () => {
    it('should insert a new history log entry', async () => {
      const input = {
        taskId: '1',
        actionType: 'created' as const,
        description: 'Task created',
      };

      await historyRepository.addLogEntry(input);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO history_logs'),
        expect.arrayContaining([
          expect.any(String), // id
          input.taskId,
          expect.any(String), // timestamp
          input.actionType,
          input.description,
        ])
      );
    });

    it('should return the created log entry with id and timestamp', async () => {
      const input = {
        taskId: '1',
        actionType: 'created' as const,
        description: 'Task created',
      };

      const result = await historyRepository.addLogEntry(input);

      expect(result).toMatchObject({
        taskId: input.taskId,
        actionType: input.actionType,
        description: input.description,
      });
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getLogsByTask', () => {
    it('should return history logs for a task', async () => {
      const mockRows = [
        {
          id: '1',
          taskId: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          actionType: 'created',
          description: 'Task created',
        },
        {
          id: '2',
          taskId: '1',
          timestamp: '2024-01-02T00:00:00.000Z',
          actionType: 'updated',
          description: 'Task updated',
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await historyRepository.getLogsByTask('1');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM history_logs WHERE taskId = ?'),
        ['1']
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        taskId: '1',
        actionType: 'created',
      });
    });

    it('should return empty array when no logs exist', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await historyRepository.getLogsByTask('999');

      expect(result).toEqual([]);
    });

    it('should order logs by timestamp descending', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await historyRepository.getLogsByTask('1');

      const call = mockDb.getAllAsync.mock.calls[0];
      expect(call[0]).toContain('ORDER BY timestamp DESC');
    });
  });

  describe('getAllLogs', () => {
    it('should return all history logs', async () => {
      const mockRows = [
        {
          id: '1',
          taskId: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          actionType: 'created',
          description: 'Task 1 created',
        },
        {
          id: '2',
          taskId: '2',
          timestamp: '2024-01-02T00:00:00.000Z',
          actionType: 'created',
          description: 'Task 2 created',
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await historyRepository.getAllLogs();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM history_logs'),
        [100] // default limit
      );
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no logs exist', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await historyRepository.getAllLogs();

      expect(result).toEqual([]);
    });

    it('should respect custom limit', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await historyRepository.getAllLogs(50);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [50]
      );
    });

    it('should order logs by timestamp descending', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await historyRepository.getAllLogs();

      const call = mockDb.getAllAsync.mock.calls[0];
      expect(call[0]).toContain('ORDER BY timestamp DESC');
    });
  });

  describe('removeLogsByTask', () => {
    it('should delete all logs for a task', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 2 });

      const result = await historyRepository.removeLogsByTask('1');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM history_logs WHERE taskId = ?'),
        ['1']
      );
      expect(result).toBe(2);
    });

    it('should return 0 if no logs exist for task', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      const result = await historyRepository.removeLogsByTask('999');

      expect(result).toBe(0);
    });
  });
});
