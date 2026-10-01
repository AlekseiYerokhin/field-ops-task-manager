import { create } from 'zustand';
import * as taskRepository from '../storage/taskRepository';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types';

type SortBy = 'createdAt' | 'dueDate' | 'status';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  sortBy: SortBy;
  fetchTasks: () => Promise<void>;
  setSortBy: (sortBy: SortBy) => void;
  deleteTask: (taskId: string) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (input: UpdateTaskInput) => Promise<Task>;
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

  deleteTask: async (taskId: string) => {
    set({ isLoading: true, error: null });
    try {
      await taskRepository.deleteTask(taskId);
      await get().fetchTasks();
    } catch {
      set({ error: 'Failed to delete task', isLoading: false });
    }
  },

  createTask: async (input: CreateTaskInput) => {
    set({ isLoading: true, error: null });
    try {
      const task = await taskRepository.createTask(input);
      await get().fetchTasks();
      set({ isLoading: false });
      return task;
    } catch {
      set({ error: 'Failed to create task', isLoading: false });
      throw new Error('Failed to create task');
    }
  },

  updateTask: async (input: UpdateTaskInput) => {
    set({ isLoading: true, error: null });
    try {
      const task = await taskRepository.updateTask(input);
      if (!task) {
        set({ isLoading: false });
        throw new Error('Task not found');
      }
      await get().fetchTasks();
      set({ isLoading: false });
      return task;
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        throw error;
      }
      set({ error: 'Failed to update task', isLoading: false });
      throw new Error('Failed to update task');
    }
  },
}));
