import { create } from 'zustand';
import type { SyncStatus } from '../types';

interface SyncState {
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  setSyncStatus: (status: SyncStatus) => void;
  setLastSyncTime: (time: string) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  syncStatus: 'synced',
  lastSyncTime: null,
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
}));
