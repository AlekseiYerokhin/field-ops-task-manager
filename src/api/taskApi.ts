import { apiRequest } from './apiClient';
import type { Task } from '../types';

export const taskApi = {
  getAll: () => apiRequest<Task[]>('/tasks'),

  getById: (id: string) => apiRequest<Task>(`/tasks/${id}`),

  create: (task: Task) =>
    apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  update: (id: string, task: Partial<Task>) =>
    apiRequest<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(task),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
