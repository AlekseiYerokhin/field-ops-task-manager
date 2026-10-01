import NetInfo from '@react-native-community/netinfo';
import { taskApi } from '../api';
import * as taskRepository from '../storage/taskRepository';
import * as historyRepository from '../storage/historyRepository';
import { mergeTasks } from './conflictResolver';
import { useSyncStore } from '../store';

let isSyncing = false;
let unsubscribe: (() => void) | null = null;

export function initializeSyncListener(): void {
  unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && !isSyncing) {
      syncPendingChanges();
    }
  });
}

export function cleanupSyncListener(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

export async function syncPendingChanges(): Promise<void> {
  if (isSyncing) return;

  isSyncing = true;
  const { setSyncStatus, setLastSyncTime } = useSyncStore.getState();

  try {
    setSyncStatus('pending');

    const pendingTasks = await taskRepository.getPendingTasks();

    if (pendingTasks.length === 0) {
      setSyncStatus('synced');
      setLastSyncTime(new Date().toISOString());
      isSyncing = false;
      return;
    }

    // Fetch the authoritative list from the server once
    let serverTasks: Record<string, any> = {};
    try {
      const all = await taskApi.getAll();
      serverTasks = all.reduce((acc: Record<string, any>, t: any) => {
        acc[t.id] = t;
        return acc;
      }, {});
    } catch {
      serverTasks = {};
    }

    for (const local of pendingTasks) {
      try {
        const remote = serverTasks[local.id];

        if (remote) {
          // Conflict: merge using field-level strategy, then push result
          const merged = mergeTasks(local, remote as any);
          await taskApi.update(local.id, merged);
          await taskRepository.updateTaskSyncStatus(local.id, 'synced');
        } else {
          // No remote record: create it
          await taskApi.create(local);
          await taskRepository.updateTaskSyncStatus(local.id, 'synced');
        }

        await historyRepository.addLogEntry({
          taskId: local.id,
          actionType: 'synced',
          description: `Task "${local.title}" synced to server`,
        });
      } catch {
        // Keep as pending for retry
      }
    }

    setSyncStatus('synced');
    setLastSyncTime(new Date().toISOString());
  } catch {
    setSyncStatus('failed');
  } finally {
    isSyncing = false;
  }
}

export async function checkConnectivity(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected || false;
}
