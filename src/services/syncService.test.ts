import {
  syncPendingChanges,
  initializeSyncListener,
  cleanupSyncListener,
  checkConnectivity,
} from './syncService';
import { taskApi } from '../api';
import * as taskRepository from '../storage/taskRepository';
import * as historyRepository from '../storage/historyRepository';
import { useSyncStore } from '../store';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../api');
jest.mock('../storage/taskRepository');
jest.mock('../storage/historyRepository');
jest.mock('../store');

const mockedTaskApi = taskApi as jest.Mocked<typeof taskApi>;
const mockedTaskRepository = taskRepository as jest.Mocked<typeof taskRepository>;
const mockedHistoryRepository = historyRepository as jest.Mocked<typeof historyRepository>;
const mockedUseSyncStore = useSyncStore as jest.Mocked<typeof useSyncStore>;

describe('syncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const mockSetSyncStatus = jest.fn();
    const mockSetLastSyncTime = jest.fn();
    (mockedUseSyncStore.getState as jest.Mock).mockReturnValue({
      syncStatus: 'synced',
      lastSyncTime: null,
      setSyncStatus: mockSetSyncStatus,
      setLastSyncTime: mockSetLastSyncTime,
    });
  });

  describe('syncPendingChanges', () => {
    it('marks as synced when no pending tasks', async () => {
      mockedTaskRepository.getPendingTasks.mockResolvedValue([]);

      await syncPendingChanges();

      const { setSyncStatus } = mockedUseSyncStore.getState();
      expect(setSyncStatus).toHaveBeenCalledWith('synced');
    });

    it('creates tasks that do not exist on the server', async () => {
      const localTask = {
        id: '1',
        title: 'Task',
        description: 'Desc',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Loc' },
        status: 'New',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'pending',
      };
      mockedTaskRepository.getPendingTasks.mockResolvedValue([localTask as any]);
      mockedTaskApi.getAll.mockResolvedValue([]);
      mockedTaskApi.create.mockResolvedValue(localTask as any);
      mockedTaskRepository.updateTaskSyncStatus.mockResolvedValue(true);
      mockedHistoryRepository.addLogEntry.mockResolvedValue({} as any);

      await syncPendingChanges();

      expect(mockedTaskApi.create).toHaveBeenCalledWith(localTask);
      expect(mockedTaskRepository.updateTaskSyncStatus).toHaveBeenCalledWith('1', 'synced');
      expect(mockedHistoryRepository.addLogEntry).toHaveBeenCalledWith(
        expect.objectContaining({ actionType: 'synced' })
      );
    });

    it('merges conflicts and updates the server', async () => {
      const localTask = {
        id: '1',
        title: 'Local Title',
        description: 'Desc',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Loc' },
        status: 'New',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'pending',
      };
      const remoteTask = {
        id: '1',
        title: 'Remote Title',
        description: 'Desc',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Loc' },
        status: 'New',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'synced',
      };
      mockedTaskRepository.getPendingTasks.mockResolvedValue([localTask as any]);
      mockedTaskApi.getAll.mockResolvedValue([remoteTask as any]);
      mockedTaskApi.update.mockResolvedValue(remoteTask as any);
      mockedTaskRepository.updateTaskSyncStatus.mockResolvedValue(true);
      mockedHistoryRepository.addLogEntry.mockResolvedValue({} as any);

      await syncPendingChanges();

      expect(mockedTaskApi.update).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockedTaskRepository.updateTaskSyncStatus).toHaveBeenCalledWith('1', 'synced');
    });

    it('sets status to failed on sync error', async () => {
      mockedTaskRepository.getPendingTasks.mockRejectedValue(new Error('DB error'));

      await syncPendingChanges();

      const { setSyncStatus } = mockedUseSyncStore.getState();
      expect(setSyncStatus).toHaveBeenCalledWith('failed');
    });
  });

  describe('initializeSyncListener', () => {
    it('registers a NetInfo listener', () => {
      initializeSyncListener();
      expect(NetInfo.addEventListener).toHaveBeenCalled();
      cleanupSyncListener();
    });
  });

  describe('checkConnectivity', () => {
    it('returns connectivity state', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      await expect(checkConnectivity()).resolves.toBe(true);
    });
  });
});
