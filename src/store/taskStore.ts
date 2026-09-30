import { create } from 'zustand';
import * as taskRepository from '../storage/taskRepository';
import type { Task } from '../types';

type SortBy = 'createdAt' | 'dueDate' | 'status';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  sortBy: SortBy;
  fetchTasks: () => Promise<void>;
  setSortBy: (sortBy: SortBy) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  sortBy: 'dueDate',

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { sortBy } = get();
      const tasks = await taskRepository.getAllTasks(sortBy);
      set({ tasks, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch tasks', isLoading: false });
    }
  },

  setSortBy: (sortBy: SortBy) => {
    set({ sortBy });
    get().fetchTasks();
  },
}));
