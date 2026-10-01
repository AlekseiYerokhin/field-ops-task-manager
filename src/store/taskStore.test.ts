import { useTaskStore } from './taskStore';
import * as taskRepository from '../storage/taskRepository';
import * as historyRepository from '../storage/historyRepository';

// Mock the repositories
jest.mock('../storage/taskRepository');
jest.mock('../storage/historyRepository');

const mockedTaskRepository = taskRepository as jest.Mocked<typeof taskRepository>;
const mockedHistoryRepository = historyRepository as jest.Mocked<typeof historyRepository>;

describe('taskStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTaskStore.setState({
      tasks: [],
      isLoading: false,
      error: null,
      sortBy: 'dueDate',
    });
    jest.clearAllMocks();
  });

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: 'New' as const,
          dueDate: '2024-12-31T00:00:00.000Z',
          location: { address: 'Test Location' },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          syncStatus: 'synced' as const,
        },
      ];

      mockedTaskRepository.getAllTasks.mockResolvedValue(mockTasks);

      await useTaskStore.getState().fetchTasks();

      expect(useTaskStore.getState().tasks).toEqual(mockTasks);
      expect(useTaskStore.getState().isLoading).toBe(false);
      expect(useTaskStore.getState().error).toBeNull();
    });

    it('should handle fetch error', async () => {
      mockedTaskRepository.getAllTasks.mockRejectedValue(new Error('Failed to fetch'));

      await useTaskStore.getState().fetchTasks();

      expect(useTaskStore.getState().tasks).toEqual([]);
      expect(useTaskStore.getState().isLoading).toBe(false);
      expect(useTaskStore.getState().error).toBe('Failed to fetch tasks');
    });

    it('should set isLoading to true while fetching', async () => {
      let resolvePromise: (value: any[]) => void;
      const promise = new Promise<any[]>((resolve) => {
        resolvePromise = resolve;
      });

      mockedTaskRepository.getAllTasks.mockReturnValue(promise);

      const fetchPromise = useTaskStore.getState().fetchTasks();
      expect(useTaskStore.getState().isLoading).toBe(true);

      resolvePromise!([]);
      await fetchPromise;

      expect(useTaskStore.getState().isLoading).toBe(false);
    });

    it('should use current sortBy value when fetching', async () => {
      useTaskStore.setState({ sortBy: 'createdAt' });
      mockedTaskRepository.getAllTasks.mockResolvedValue([]);

      await useTaskStore.getState().fetchTasks();

      expect(mockedTaskRepository.getAllTasks).toHaveBeenCalledWith('createdAt');
    });
  });

  describe('setSortBy', () => {
    it('should update sortBy value', () => {
      useTaskStore.getState().setSortBy('createdAt');

      expect(useTaskStore.getState().sortBy).toBe('createdAt');
    });

    it('should trigger fetchTasks after setting sortBy', () => {
      mockedTaskRepository.getAllTasks.mockResolvedValue([]);

      useTaskStore.getState().setSortBy('status');

      expect(mockedTaskRepository.getAllTasks).toHaveBeenCalledWith('status');
    });

    it('should accept all valid sort options', () => {
      const validSorts = ['createdAt', 'dueDate', 'status'] as const;

      validSorts.forEach((sort) => {
        useTaskStore.getState().setSortBy(sort);
        expect(useTaskStore.getState().sortBy).toBe(sort);
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockedTaskRepository.getTask.mockResolvedValue({
        id: '1',
        title: 'Task to delete',
        description: 'Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Location' },
        status: 'New' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'synced' as const,
      });
      mockedTaskRepository.deleteTask.mockResolvedValue(true);
      mockedTaskRepository.getAllTasks.mockResolvedValue([]);
      mockedHistoryRepository.addLogEntry.mockResolvedValue({
        id: '1',
        taskId: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'deleted',
        description: 'Task deleted',
      });

      await useTaskStore.getState().deleteTask('1');

      expect(mockedTaskRepository.deleteTask).toHaveBeenCalledWith('1');
      expect(mockedHistoryRepository.addLogEntry).toHaveBeenCalledWith({
        taskId: '1',
        actionType: 'deleted',
        description: 'Task "Task to delete" deleted',
      });
      expect(useTaskStore.getState().isLoading).toBe(false);
      expect(useTaskStore.getState().error).toBeNull();
    });

    it('should refresh tasks after deletion', async () => {
      mockedTaskRepository.getTask.mockResolvedValue({
        id: '1',
        title: 'Task to delete',
        description: 'Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Location' },
        status: 'New' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'synced' as const,
      });
      mockedTaskRepository.deleteTask.mockResolvedValue(true);
      mockedTaskRepository.getAllTasks.mockResolvedValue([]);
      mockedHistoryRepository.addLogEntry.mockResolvedValue({
        id: '1',
        taskId: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'deleted',
        description: 'Task deleted',
      });

      await useTaskStore.getState().deleteTask('1');

      expect(mockedTaskRepository.getAllTasks).toHaveBeenCalled();
      expect(mockedHistoryRepository.addLogEntry).toHaveBeenCalled();
    });

    it('should handle delete error', async () => {
      mockedTaskRepository.deleteTask.mockRejectedValue(new Error('Delete failed'));

      await useTaskStore.getState().deleteTask('1');

      expect(useTaskStore.getState().isLoading).toBe(false);
      expect(useTaskStore.getState().error).toBe('Failed to delete task');
    });

    it('should set isLoading to true while deleting', async () => {
      let resolveDelete: (value: boolean) => void;
      const deletePromise = new Promise<boolean>((resolve) => {
        resolveDelete = resolve;
      });

      mockedTaskRepository.deleteTask.mockReturnValue(deletePromise);
      mockedTaskRepository.getAllTasks.mockResolvedValue([]);

      const deleteTaskPromise = useTaskStore.getState().deleteTask('1');
      expect(useTaskStore.getState().isLoading).toBe(true);

      resolveDelete!(true);
      await deleteTaskPromise;

      expect(useTaskStore.getState().isLoading).toBe(false);
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useTaskStore.getState();

      expect(state.tasks).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.sortBy).toBe('dueDate');
    });
  });
});

describe('createTask', () => {
  it('should create a task successfully', async () => {
    const input = {
      title: 'New Task',
      description: 'New Description',
      dueDate: '2024-12-31T00:00:00.000Z',
      location: { address: 'New Location' },
      status: 'New' as const,
    };

    const createdTask = {
      id: '1',
      ...input,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      syncStatus: 'pending' as const,
    };

    mockedTaskRepository.createTask.mockResolvedValue(createdTask);
    mockedTaskRepository.getAllTasks.mockResolvedValue([createdTask]);
    mockedHistoryRepository.addLogEntry.mockResolvedValue({
      id: '1',
      taskId: '1',
      timestamp: '2024-01-01T00:00:00.000Z',
      actionType: 'created',
      description: 'Task created',
    });

    const result = await useTaskStore.getState().createTask(input);

    expect(mockedTaskRepository.createTask).toHaveBeenCalledWith(input);
    expect(result).toEqual(createdTask);
    expect(mockedHistoryRepository.addLogEntry).toHaveBeenCalledWith({
      taskId: '1',
      actionType: 'created',
      description: 'Task "New Task" created',
    });
    expect(useTaskStore.getState().isLoading).toBe(false);
    expect(useTaskStore.getState().error).toBeNull();
  });

  it('should refresh tasks after creation', async () => {
    const input = {
      title: 'New Task',
      description: 'New Description',
      dueDate: '2024-12-31T00:00:00.000Z',
      location: { address: 'New Location' },
      status: 'New' as const,
    };

    const createdTask = {
      id: '1',
      ...input,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      syncStatus: 'pending' as const,
    };

    mockedTaskRepository.createTask.mockResolvedValue(createdTask);
    mockedTaskRepository.getAllTasks.mockResolvedValue([createdTask]);
    mockedHistoryRepository.addLogEntry.mockResolvedValue({
      id: '1',
      taskId: '1',
      timestamp: '2024-01-01T00:00:00.000Z',
      actionType: 'created',
      description: 'Task created',
    });

    await useTaskStore.getState().createTask(input);

    expect(mockedTaskRepository.getAllTasks).toHaveBeenCalled();
    expect(mockedHistoryRepository.addLogEntry).toHaveBeenCalled();
  });

  it('should handle create error', async () => {
    const input = {
      title: 'New Task',
      description: 'New Description',
      dueDate: '2024-12-31T00:00:00.000Z',
      location: { address: 'New Location' },
      status: 'New' as const,
    };

    mockedTaskRepository.createTask.mockRejectedValue(new Error('Create failed'));

    await expect(useTaskStore.getState().createTask(input)).rejects.toThrow(
      'Failed to create task'
    );

    expect(useTaskStore.getState().isLoading).toBe(false);
    expect(useTaskStore.getState().error).toBe('Failed to create task');
  });
});

describe('updateTask', () => {
  it('should update a task successfully', async () => {
    const input = {
      id: '1',
      title: 'Updated Task',
      description: 'Updated Description',
      dueDate: '2024-12-31T00:00:00.000Z',
      location: { address: 'Updated Location' },
      status: 'In Progress' as const,
    };

    const existingTask = {
      id: '1',
      title: 'Old Task',
      description: 'Old Description',
      dueDate: '2024-12-31T00:00:00.000Z',
      location: { address: 'Old Location' },
      status: 'New' as const,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      syncStatus: 'synced' as const,
    };

    const updatedTask = {
      ...input,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      syncStatus: 'pending' as const,
    };

    mockedTaskRepository.getTask.mockResolvedValue(existingTask);
    mockedTaskRepository.updateTask.mockResolvedValue(updatedTask);
    mockedTaskRepository.getAllTasks.mockResolvedValue([updatedTask]);
    mockedHistoryRepository.addLogEntry.mockResolvedValue({
      id: '1',
      taskId: '1',
      timestamp: '2024-01-01T00:00:00.000Z',
      actionType: 'edited',
      description: 'Task updated',
    });

    const result = await useTaskStore.getState().updateTask(input);

    expect(mockedTaskRepository.updateTask).toHaveBeenCalledWith(input);
    expect(result).toEqual(updatedTask);
    expect(mockedHistoryRepository.addLogEntry).toHaveBeenCalled();
    expect(useTaskStore.getState().isLoading).toBe(false);
    expect(useTaskStore.getState().error).toBeNull();
  });

  it('should refresh tasks after update', async () => {
    const input = {
      id: '1',
      title: 'Updated Task',
    };

    const existingTask = {
      id: '1',
      title: 'Old Task',
      description: 'Description',
      dueDate: '2024-12-31T00:00:00.000Z',
      location: { address: 'Location' },
      status: 'New' as const,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      syncStatus: 'synced' as const,
    };

    const updatedTask = {
      id: '1',
      title: 'Updated Task',
      description: 'Description',
      dueDate: '2024-12-31T00:00:00.000Z',
      location: { address: 'Location' },
      status: 'New' as const,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      syncStatus: 'pending' as const,
    };

    mockedTaskRepository.getTask.mockResolvedValue(existingTask);
    mockedTaskRepository.updateTask.mockResolvedValue(updatedTask);
    mockedTaskRepository.getAllTasks.mockResolvedValue([updatedTask]);
    mockedHistoryRepository.addLogEntry.mockResolvedValue({
      id: '1',
      taskId: '1',
      timestamp: '2024-01-01T00:00:00.000Z',
      actionType: 'edited',
      description: 'Task updated',
    });

    await useTaskStore.getState().updateTask(input);

    expect(mockedTaskRepository.getAllTasks).toHaveBeenCalled();
    expect(mockedHistoryRepository.addLogEntry).toHaveBeenCalled();
  });

  it('should handle update error', async () => {
    const input = {
      id: '1',
      title: 'Updated Task',
    };

    const existingTask = {
      id: '1',
      title: 'Old Task',
      description: 'Description',
      dueDate: '2024-12-31T00:00:00.000Z',
      location: { address: 'Location' },
      status: 'New' as const,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      syncStatus: 'synced' as const,
    };

    mockedTaskRepository.getTask.mockResolvedValue(existingTask);
    mockedTaskRepository.updateTask.mockRejectedValue(new Error('Update failed'));

    await expect(useTaskStore.getState().updateTask(input)).rejects.toThrow(
      'Failed to update task'
    );

    expect(useTaskStore.getState().isLoading).toBe(false);
    expect(useTaskStore.getState().error).toBe('Failed to update task');
  });

  it('should throw error if task not found', async () => {
    const input = {
      id: '999',
      title: 'Updated Task',
    };

    mockedTaskRepository.updateTask.mockResolvedValue(null);

    await expect(useTaskStore.getState().updateTask(input)).rejects.toThrow('Task not found');
  });
});
