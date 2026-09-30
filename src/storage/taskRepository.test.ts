import * as taskRepository from './taskRepository';
import { getDatabase } from './database';

// Mock the database module
jest.mock('./database');

const mockedGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

describe('taskRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
    };

    mockedGetDatabase.mockResolvedValue(mockDb);
  });

  describe('createTask', () => {
    it('should insert a new task into database', async () => {
      const input = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Test Location' },
      };

      await taskRepository.createTask(input);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        expect.arrayContaining([
          expect.any(String), // id
          input.title,
          input.description,
          input.dueDate,
          input.location.address,
          null, // latitude
          null, // longitude
          'New', // default status
          expect.any(String), // createdAt
          expect.any(String), // updatedAt
          'pending', // syncStatus
        ])
      );
    });

    it('should return the created task with id and timestamps', async () => {
      const input = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Test Location' },
      };

      const result = await taskRepository.createTask(input);

      expect(result).toMatchObject({
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        location: input.location,
        status: 'New',
        syncStatus: 'pending',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should use provided status if given', async () => {
      const input = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Test Location' },
        status: 'In Progress' as const,
      };

      const result = await taskRepository.createTask(input);

      expect(result.status).toBe('In Progress');
    });
  });

  describe('getTask', () => {
    it('should return task when found', async () => {
      const mockRow = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        locationAddress: 'Test Location',
        locationLatitude: null,
        locationLongitude: null,
        status: 'New',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'synced',
      };

      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await taskRepository.getTask('1');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tasks WHERE id = ?'),
        ['1']
      );
      expect(result).toEqual({
        id: mockRow.id,
        title: mockRow.title,
        description: mockRow.description,
        dueDate: mockRow.dueDate,
        location: {
          address: mockRow.locationAddress,
          latitude: mockRow.locationLatitude,
          longitude: mockRow.locationLongitude,
        },
        status: mockRow.status,
        createdAt: mockRow.createdAt,
        updatedAt: mockRow.updatedAt,
        syncStatus: mockRow.syncStatus,
      });
    });

    it('should return null when task not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await taskRepository.getTask('999');

      expect(result).toBeNull();
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      const mockRows = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          dueDate: '2024-12-31T00:00:00.000Z',
          locationAddress: 'Location 1',
          locationLatitude: null,
          locationLongitude: null,
          status: 'New',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          syncStatus: 'synced',
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description 2',
          dueDate: '2024-12-30T00:00:00.000Z',
          locationAddress: 'Location 2',
          locationLatitude: null,
          locationLongitude: null,
          status: 'In Progress',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          syncStatus: 'synced',
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await taskRepository.getAllTasks();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tasks')
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        title: 'Task 1',
      });
    });

    it('should return empty array when no tasks exist', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await taskRepository.getAllTasks();

      expect(result).toEqual([]);
    });

    it('should sort by dueDate by default', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await taskRepository.getAllTasks();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY dueDate ASC')
      );
    });

    it('should sort by createdAt when specified', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await taskRepository.getAllTasks('createdAt');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY createdAt DESC')
      );
    });

    it('should sort by status when specified', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await taskRepository.getAllTasks('status');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY status ASC')
      );
    });
  });

  describe('updateTask', () => {
    it('should update task fields', async () => {
      const existingTask = {
        id: '1',
        title: 'Old Title',
        description: 'Old Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Old Location' },
        status: 'New' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'synced' as const,
      };

      mockDb.getFirstAsync.mockResolvedValue({
        id: existingTask.id,
        title: existingTask.title,
        description: existingTask.description,
        dueDate: existingTask.dueDate,
        locationAddress: existingTask.location.address,
        locationLatitude: null,
        locationLongitude: null,
        status: existingTask.status,
        createdAt: existingTask.createdAt,
        updatedAt: existingTask.updatedAt,
        syncStatus: existingTask.syncStatus,
      });

      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      const input = {
        id: '1',
        title: 'Updated Title',
      };

      const result = await taskRepository.updateTask(input);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tasks SET'),
        expect.arrayContaining([
          'Updated Title',
          expect.any(String), // updatedAt
          '1',
        ])
      );
      expect(result).toBeDefined();
      expect(result?.title).toBe('Updated Title');
    });

    it('should return null if task not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await taskRepository.updateTask({ id: '999', title: 'Updated' });

      expect(result).toBeNull();
    });

    it('should set syncStatus to pending after update', async () => {
      const existingTask = {
        id: '1',
        title: 'Old Title',
        description: 'Old Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Old Location' },
        status: 'New' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'synced' as const,
      };

      mockDb.getFirstAsync.mockResolvedValue({
        id: existingTask.id,
        title: existingTask.title,
        description: existingTask.description,
        dueDate: existingTask.dueDate,
        locationAddress: existingTask.location.address,
        locationLatitude: null,
        locationLongitude: null,
        status: existingTask.status,
        createdAt: existingTask.createdAt,
        updatedAt: existingTask.updatedAt,
        syncStatus: existingTask.syncStatus,
      });

      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      const result = await taskRepository.updateTask({ id: '1', title: 'Updated' });

      expect(result?.syncStatus).toBe('pending');
    });
  });

  describe('deleteTask', () => {
    it('should delete task by id', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      const result = await taskRepository.deleteTask('1');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM tasks WHERE id = ?'),
        ['1']
      );
      expect(result).toBe(true);
    });

    it('should return false if task not found', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      const result = await taskRepository.deleteTask('999');

      expect(result).toBe(false);
    });
  });
});
